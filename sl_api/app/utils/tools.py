# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from channels.layers import get_channel_layer
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, BadHeaderError
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from scipy.interpolate import RectBivariateSpline
from skimage.measure import block_reduce
import asyncio
import json
import numpy as np


def send_custom_email(subject, template_name, context, recipient):
    email_body = render_to_string(template_name, context)
    email_body_plain = strip_tags(email_body)
    sender = settings.EMAIL_HOST_USER

    try:
        print(f"Sending email to {recipient}")
        msg = EmailMultiAlternatives(subject, email_body_plain, sender, recipient)
        msg.attach_alternative(email_body, "text/html")
        msg.send()
    except BadHeaderError:
        return HttpResponse("Invalid header found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


def stream_message_over_websocket(message, group_name):
    channel_layer = get_channel_layer()

    # Send message data to WebSocket consumer
    loop = asyncio.get_event_loop()
    coroutine = channel_layer.group_send(
        group_name,
        {"type": "send_websocket_data", "data": json.dumps(message)},
    )
    loop.run_until_complete(coroutine)


def create_matrix_from_grid(grid_messages):
    """
    Convert grid messages into a 2D numpy array of intensities with direct position access.
    """
    # Get all unique positions in order
    x_positions = sorted({msg.x_pos for msg in grid_messages})
    y_positions = sorted({msg.y_pos for msg in grid_messages})

    # Initialize matrix with (X,Y) orientation
    matrix = np.zeros((len(x_positions), len(y_positions)))

    # Create position mappings
    x_idx = {x: i for i, x in enumerate(x_positions)}
    y_idx = {y: i for i, y in enumerate(y_positions)}

    # Fill matrix (transposed orientation)
    for msg in grid_messages:
        matrix[x_idx[msg.x_pos], y_idx[msg.y_pos]] = msg.intensity

    return matrix


def smooth_matrix_with_spline(
    input_matrix: np.ndarray, smoothing_factor: float = 0.1, high_resolution: int = 100
) -> np.ndarray:
    """
    Applies bicubic spline smoothing with high-res interpolation and downsampling.
    """
    rows, cols = input_matrix.shape
    x_orig = np.arange(cols)
    y_orig = np.arange(rows)

    spline = RectBivariateSpline(
        x_orig, y_orig, input_matrix, kx=3, ky=3, s=smoothing_factor
    )

    x_hi = np.linspace(0, cols - 1, high_resolution)
    y_hi = np.linspace(0, rows - 1, high_resolution)
    hi_res_spline = spline(x_hi, y_hi)

    row_block = high_resolution // rows
    col_block = high_resolution // cols
    smoothed_matrix = block_reduce(
        hi_res_spline, block_size=(row_block, col_block), func=np.mean
    )[:rows, :cols]

    return np.round(smoothed_matrix).astype(int)


def safe_smooth(matrix: np.ndarray, s: float = 0.0001) -> np.ndarray:
    """
    Applies minimal bicubic spline smoothing without resampling.
    Used as a fallback when standard smoothing fails.
    """
    x = np.arange(matrix.shape[0])
    y = np.arange(matrix.shape[1])
    spline = RectBivariateSpline(x, y, matrix, kx=3, ky=3, s=s)
    return spline(x, y)


def robust_smoothing(matrix: np.ndarray) -> np.ndarray:
    """
    Attempts smoothing with fallback layers:
    1. Try standard spline smoothing
    2. Fall back to minimal smoothing
    3. Return original if both fail
    """
    try:
        return smooth_matrix_with_spline(matrix)
    except Exception as e1:
        try:
            print(f"Primary smoothing failed ({str(e1)}), trying safe mode")
            return safe_smooth(matrix)
        except Exception as e2:
            print(f"All smoothing failed ({str(e2)}), returning original")
            return matrix.copy()


def smart_gaussian_extrapolate(matrix, sigma_ratio=0.25, min_padding=5):
    """
    Automatically expands matrix with Gaussian falloff until reaching zero.
    """
    # Calculate auto-padding based on intensity drop-off
    edge_mean = np.mean(
        np.concatenate([matrix[0, :], matrix[-1, :], matrix[:, 0], matrix[:, -1]])
    )
    center_value = np.max(matrix)
    padding = max(min_padding, int(0.5 * center_value / edge_mean))
    # Create expanded grid
    h, w = matrix.shape
    x = np.linspace(-padding, h + padding, h + 2 * padding)
    y = np.linspace(-padding, w + padding, w + 2 * padding)
    xx, yy = np.meshgrid(x, y, indexing="ij")

    # Distance from original matrix edges (in pixels)
    dist = np.maximum(
        np.maximum(-xx, xx - (h - 1)),  # Horizontal distance
        np.maximum(-yy, yy - (w - 1)),  # Vertical distance
    )

    # Auto-sigma based on padding
    sigma = sigma_ratio * padding

    # Gaussian falloff mask (1 at matrix, 0 at edges)
    mask = np.exp(-(np.maximum(dist, 0) ** 2) / (2 * sigma**2))

    # Apply mask to padded matrix
    padded = np.pad(matrix, padding, mode="edge")
    result = padded * mask
    result = np.round(result)
    return result

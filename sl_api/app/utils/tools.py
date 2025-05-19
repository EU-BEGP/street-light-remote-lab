# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from channels.layers import get_channel_layer
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, BadHeaderError
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from scipy.interpolate import Rbf
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


def perform_2d_spline(
    input_matrix: np.ndarray,
    initial_smoothing_factor: float = 0.1,
    max_attempts: int = 5,
) -> np.ndarray:
    """
    Performs bicubic spline interpolation on a 2D input matrix with robust handling
    of convergence issues by automatically adjusting the smoothing factor.
    """

    rows, cols = input_matrix.shape
    x_orig = np.arange(cols)
    y_orig = np.arange(rows)
    smoothing_factor = initial_smoothing_factor

    for attempt in range(max_attempts):
        try:
            spline = RectBivariateSpline(
                x_orig, y_orig, input_matrix, kx=3, ky=3, s=smoothing_factor
            )
            smoothed_matrix = spline(x_orig, y_orig)
            return np.round(smoothed_matrix)
        except Exception as e:
            print(
                f"Spline fitting attempt {attempt + 1} failed with s={smoothing_factor}: {e}"
            )
            smoothing_factor *= 10  # Increase smoothing factor for the next attempt

    print(
        "Spline fitting failed after multiple attempts. Returning the original matrix."
    )
    return input_matrix.copy()


def rbf_interpolation_expansion(
    matrix, target_size=16, function="multiquadric", epsilon=None
):
    """
    Expands a matrix using RBF interpolation, ensuring edges decay toward zero.

    Args:
        matrix: Input numpy array of light intensities.
        target_size: Output size
        function: RBF kernel type ('multiquadric', 'gaussian', etc.).
        epsilon: Shape parameter for RBF (auto-calculated if None).

    Returns:
        Expanded Matrix
    """
    # Original grid coordinates (8x8)
    h, w = matrix.shape
    x_orig = np.linspace(0, 1, h)
    y_orig = np.linspace(0, 1, w)
    xx_orig, yy_orig = np.meshgrid(x_orig, y_orig, indexing="ij")

    # Fit RBF to original data
    rbf = Rbf(
        xx_orig.flatten(),
        yy_orig.flatten(),
        matrix.flatten(),
        function=function,
        epsilon=epsilon,
    )

    # Expanded grid coordinates
    x_new = np.linspace(-0.5, 1.5, target_size)
    y_new = np.linspace(-0.5, 1.5, target_size)
    xx_new, yy_new = np.meshgrid(x_new, y_new, indexing="ij")

    # Interpolate/extrapolate
    expanded = rbf(xx_new, yy_new)

    # Clip negative values to zero (physical constraint)
    expanded = np.clip(expanded, 0, None)

    # Normalize to preserve original max intensity
    expanded = expanded * (np.max(matrix) / np.max(expanded))

    return expanded


def zero_edge_rbf_expand(matrix, target_size=16, decay_strength=2.0):
    """
    Expands matrix to target_size x target_size using RBF, enforcing zero at edges.

    Args:
        matrix: Input 8x8 numpy array.
        target_size: Output size
        decay_strength: Controls how aggressively edges are pushed to zero (higher = sharper decay).

    Returns:
        Zero-edged expanded matrix.
    """
    h, w = matrix.shape
    assert target_size > max(h, w), "Target size must be larger than input."

    # Original grid coordinates (normalized to [0, 1])
    x_orig = np.linspace(0, 1, h)
    y_orig = np.linspace(0, 1, w)
    xx_orig, yy_orig = np.meshgrid(x_orig, y_orig, indexing="ij")

    # Fit RBF to original data
    rbf = Rbf(
        xx_orig.flatten(), yy_orig.flatten(), matrix.flatten(), function="multiquadric"
    )

    # Expanded grid coordinates (normalized to [-pad, 1+pad] to force zero edges)
    pad_ratio = 0.5  # How far beyond original bounds to interpolate
    x_new = np.linspace(0 - pad_ratio, 1 + pad_ratio, target_size)
    y_new = np.linspace(0 - pad_ratio, 1 + pad_ratio, target_size)
    xx_new, yy_new = np.meshgrid(x_new, y_new, indexing="ij")

    # Interpolate/extrapolate
    expanded = rbf(xx_new, yy_new)

    # --- Enforce zero edges ---
    # Create a smooth mask that is 1.0 in the original grid and decays to 0 at edges
    mask_x = np.clip(1.0 - (np.abs(x_new - 0.5) - 0.5) / pad_ratio, 0, 1)
    mask_y = np.clip(1.0 - (np.abs(y_new - 0.5) - 0.5) / pad_ratio, 0, 1)
    mask = np.outer(mask_x, mask_y) ** decay_strength

    # Apply mask and clip negatives
    expanded = expanded * mask
    expanded = np.clip(expanded, 0, None)

    # Preserve original max intensity
    expanded = expanded * (np.max(matrix) / np.max(expanded))

    return expanded


def replicate_matrix_with_spacing(matrix, center_distance_offset=0):
    """
    Replicates a matrix 3 times horizontally with controllable spacing between centers.
    Handles collisions (overlaps) by taking the maximum value in overlapping regions,
    and fills gaps with -1 (which should be converted to NaN in TypeScript).

    Args:
        matrix: Input matrix (2D numpy array).
        center_distance_offset: Adjusts spacing between matrix centers:
            - 0: Ideal contiguous placement
            - Positive: Adds gaps between matrices (filled with -1)
            - Negative: Creates overlaps (resolved by taking maximum values)

    Returns:
        Combined matrix with 3 copies, properly spaced/collided
    """

    h, w = matrix.shape

    # Calculate starting positions for each copy
    ## First copy starts at 0
    ## Second copy starts after first matrix + offset
    ## Third copy starts after second matrix + offset
    starts = [
        0,
        w + center_distance_offset,
        2 * (w + center_distance_offset),
    ]

    # Calculate total width including spacing
    total_width = starts[-1] + w

    # Initialize result matrix with -1
    result = np.full((h, total_width), -1.0)

    # Paste each copy, handling collisions with np.maximum
    for start in starts:
        # Ensure we don't go out of bounds
        src_start = max(0, -start)
        src_end = min(w, result.shape[1] - start)
        dst_start = max(0, start)
        dst_end = min(result.shape[1], start + w)

        # Get the target slice
        target_slice = result[:, dst_start:dst_end]
        source_slice = matrix[:, src_start:src_end]

        # For existing values (collisions), take maximum; otherwise insert new values
        mask = target_slice != -1  # Only consider non-gap areas for collision
        target_slice[mask] = np.maximum(target_slice[mask], source_slice[mask])
        target_slice[~mask] = source_slice[~mask]

    return result

# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from rest_framework.views import APIView
from rest_framework.response import Response
from sl.serializers import MoveCameraSerializer, StopCameraSerializer
import os
from onvif import ONVIFCamera


def get_camera_and_services(camera_number):
    if camera_number == 1:
        ip = os.environ.get("CAMERA_LIGHTS_IP")
        user = os.environ.get("CAMERA_LIGHTS_USER")
        password = os.environ.get("CAMERA_LIGHTS_PASSWORD")
    elif camera_number == 2:
        ip = os.environ.get("CAMERA_ROBOT_IP")
        user = os.environ.get("CAMERA_ROBOT_USER")
        password = os.environ.get("CAMERA_ROBOT_PASSWORD")
    else:
        return None, None, None, None

    cam = ONVIFCamera(ip, 80, user, password)
    media_service = cam.create_media_service()
    ptz_service = cam.create_ptz_service()
    profile_token = media_service.GetProfiles()[0].token
    return cam, ptz_service, profile_token, media_service


class MoveCameraView(APIView):
    def post(self, request):
        serializer = MoveCameraSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        direction = serializer.validated_data['direction']
        camera_number = serializer.validated_data['camera_number']
        _, ptz_service, profile_token, _ = get_camera_and_services(camera_number)
        velocities = {
            'up':    {'x': 0.0,  'y': 0.5},
            'down':  {'x': 0.0,  'y': -0.5},
            'left':  {'x': -0.5, 'y': 0.0},
            'right': {'x': 0.5,  'y': 0.0}
        }
        velocity = velocities[direction]
        req = ptz_service.create_type('ContinuousMove')
        req.ProfileToken = profile_token
        req.Velocity = {'PanTilt': velocity, 'Zoom': {'x': 0.0}}
        ptz_service.ContinuousMove(req)
        return Response({'status': f'Moving {direction} on camera {camera_number}'})


class StopCameraView(APIView):
    def post(self, request):
        serializer = StopCameraSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        camera_number = serializer.validated_data['camera_number']
        _, ptz_service, profile_token, _ = get_camera_and_services(camera_number)
        req = ptz_service.create_type('Stop')
        req.ProfileToken = profile_token
        req.PanTilt = True
        req.Zoom = False
        ptz_service.Stop(req)
        return Response({'status': f'Stopped camera {camera_number}'})

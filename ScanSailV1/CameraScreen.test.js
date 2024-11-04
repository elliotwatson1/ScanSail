// Test to cgheck the camera is performing correctly

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    Constants: {
      FlashMode: {
        off: 'off',
      },
    },
  },
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('base64ImageData'),
  copyAsync: jest.fn().mockResolvedValue(),
}));

global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({
    responses: [{ fullTextAnnotation: { text: 'Detected text' } }],
  }),
});

const mockNavigate = jest.fn();

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import CameraScreen from './CameraScreen';

jest.mock('./CameraScreen', () => ({
  ...jest.requireActual('./CameraScreen'),
  performTextDetection: jest.fn(),
}));

describe('CameraScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('takes a picture and processes text', async () => {
    const { getByText } = render(<CameraScreen navigation={{ navigate: mockNavigate }} />);
    const scanButton = getByText('Scan');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(Camera.requestCameraPermissionsAsync.mock.calls.length).toBe(1);
      expect(mockNavigate).toHaveBeenCalledWith('Manual', expect.any(Object));
    });
  });

  test('navigates to Manual screen with detected text', async () => {
    const { getByText } = render(<CameraScreen navigation={{ navigate: mockNavigate }} />);
    const manualButton = getByText('Manually input results');
    fireEvent.press(manualButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Manual', { detectedText: 'Detected text' });
    });
  });
});

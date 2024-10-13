//
//  PreviewView.swift
//  SavorSnap
//
//  Created by Ryan Nair on 10/12/24.
//

@preconcurrency import AVFoundation
import UIKit

protocol PreviewSource: Sendable {
    // Connects a preview destination to this source.
    func connect(to target: PreviewTarget)
}

/// A protocol that passes the app's capture session to the `CameraPreview` view.
protocol PreviewTarget {
    // Sets the capture session on the destination.
    func setSession(_ session: AVCaptureSession)
}

/// The app's default `PreviewSource` implementation.
struct DefaultPreviewSource: PreviewSource {
    
    private let session: AVCaptureSession
    
    init(session: AVCaptureSession) {
        self.session = session
    }
    
    func connect(to target: PreviewTarget) {
        target.setSession(session)
    }
}


class PreviewView: UIView, PreviewTarget {
    
    init() {
        super.init(frame: .zero)
#if targetEnvironment(simulator)
        // The capture APIs require running on a real device. If running
        // in Simulator, display a static image to represent the video feed.
        let imageView = UIImageView(frame: UIScreen.main.bounds)
        imageView.image = UIImage(systemName: "apple.logo")!
        imageView.contentMode = .scaleAspectFit
        imageView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        addSubview(imageView)
#endif
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // Use the preview layer as the view's backing layer.
    override class var layerClass: AnyClass {
        AVCaptureVideoPreviewLayer.self
    }
    
    var previewLayer: AVCaptureVideoPreviewLayer {
        layer as! AVCaptureVideoPreviewLayer
    }
    
    nonisolated func setSession(_ session: AVCaptureSession) {
        // Connects the session with the preview layer, which allows the layer
        // to provide a live view of the captured content.
        Task { @MainActor in
            previewLayer.session = session
        }
    }
}

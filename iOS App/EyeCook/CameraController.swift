//
//  CameraController.swift
//  SavorSnap
//
//  Created by Ryan Nair on 10/12/24.
//

import UIKit
import AVFoundation

class CameraViewController: UIViewController {
    
    private let cameraModel = CameraModel()
    #if targetEnvironment(simulator)
    private let previewView = UIImageView()
    #else
    private let previewView = PreviewView()
    #endif
    private let shutterButton = UIButton(type: .system)
    private let thumbnailView = UIImageView()
    private let flashView = UIView()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.title = "Camera"
        setupUI()
        #if targetEnvironment(simulator)
        previewView.image = UIImage(systemName: "apple.logo")!
        previewView.contentMode = .scaleAspectFit
        previewView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        #endif
    }
    
    #if !targetEnvironment(simulator)
    override func viewDidAppear(_ animated: Bool) {
        setupCamera()
    }
    #endif
    
    private func setupUI() {
        view.backgroundColor = .black
        
        // Setup preview view
        view.addSubview(previewView)
        previewView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            previewView.topAnchor.constraint(equalTo: view.topAnchor),
            previewView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            previewView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            previewView.heightAnchor.constraint(equalTo: view.heightAnchor, multiplier: 0.9)
        ])
        
        // Setup shutter button
        view.addSubview(shutterButton)
        shutterButton.translatesAutoresizingMaskIntoConstraints = false
        shutterButton.setTitle("Capture", for: .normal)
        shutterButton.backgroundColor = .white
        shutterButton.setTitleColor(.black, for: .normal)
        shutterButton.layer.cornerRadius = 30
        shutterButton.addTarget(self, action: #selector(capturePhoto), for: .touchUpInside)
        NSLayoutConstraint.activate([
            shutterButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            shutterButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -40),
            shutterButton.widthAnchor.constraint(equalToConstant: 100),
            shutterButton.heightAnchor.constraint(equalToConstant: 60)
        ])
        
        // Setup thumbnail view
        view.addSubview(thumbnailView)
        thumbnailView.translatesAutoresizingMaskIntoConstraints = false
        thumbnailView.contentMode = .scaleAspectFill
        thumbnailView.layer.cornerRadius = 30
        thumbnailView.layer.masksToBounds = true
        thumbnailView.backgroundColor = .lightGray
        NSLayoutConstraint.activate([
            thumbnailView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            thumbnailView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -20),
            thumbnailView.widthAnchor.constraint(equalToConstant: 125),
            thumbnailView.heightAnchor.constraint(equalToConstant: 125)
        ])
        
        let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(showThumbnail(_:)))
        thumbnailView.addGestureRecognizer(tapGestureRecognizer)
        
        view.addSubview(flashView)
        flashView.translatesAutoresizingMaskIntoConstraints = false
        flashView.backgroundColor = .white
        flashView.alpha = 0
        NSLayoutConstraint.activate([
            flashView.topAnchor.constraint(equalTo: view.topAnchor),
            flashView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            flashView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            flashView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
    
    @objc private func showThumbnail(_ sender: UIImageView) {
        cameraModel.stop()
        navigationController?.pushViewController(ImageProcessingViewController(image: thumbnailView.image.unsafelyUnwrapped), animated: true)
    }
    
    #if !targetEnvironment(simulator)
    private func setupCamera() {
        cameraModel.previewSource.connect(to: previewView)
        
        Task {
            await cameraModel.start()
        }
    }
    #endif
    
    @objc private func capturePhoto() {
        Task {
            UIView.animate(withDuration: 0.1, animations: {
                self.flashView.alpha = 1
            }) { _ in
                UIView.animate(withDuration: 0.1) {
                    self.flashView.alpha = 0
                }
            }
            #if targetEnvironment(simulator)
                self.thumbnailView.image = UIImage(systemName: "apple.logo")!
            #else
                let thumbnail = await cameraModel.capturePhoto()
                self.thumbnailView.image = UIImage(data: thumbnail!.data)
                thumbnailView.isUserInteractionEnabled = true
            #endif
        }
    }
}

//
//  ViewController.swift
//  SavorSnap
//
//  Created by Ryan Nair on 10/12/24.
//

import UIKit

class OnboardingViewController: UIViewController {
    
    private let titleLabel: UILabel = {
        let label = UILabel()
        label.text = "Welcome to\nEyeCook"
        label.numberOfLines = 0
        label.textAlignment = .center
        label.font = UIFont.systemFont(ofSize: 48, weight: .bold)
        label.alpha = 0
        return label
    }()
    
    private let featureStackView: UIStackView = {
        let stackView = UIStackView()
        stackView.axis = .vertical
        stackView.spacing = 40
        stackView.alignment = .center
        stackView.alpha = 0
        return stackView
    }()
    
    private let continueButton: UIButton = UIButton(type: .system)
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        continueButton.setTitle("Continue", for: .normal)
        continueButton.backgroundColor = .systemBlue
        continueButton.setTitleColor(.white, for: .normal)
        continueButton.layer.cornerRadius = 15
        continueButton.alpha = 0
        continueButton.addTarget(self, action: #selector(showCamera(_:)), for: .touchUpInside)

        setupViews()
    }
    
    @objc private func showCamera(_ sender: UIButton) {
        let navigationController = UINavigationController(rootViewController: CameraViewController())
        
        if let window = UIApplication.shared.windows.first {
            window.rootViewController = navigationController
            window.makeKeyAndVisible()
        }
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        animateOnboarding()
    }
    
    private func setupViews() {
        view.backgroundColor = .systemBackground
        
        view.addSubview(titleLabel)
        view.addSubview(featureStackView)
        view.addSubview(continueButton)
        
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        featureStackView.translatesAutoresizingMaskIntoConstraints = false
        continueButton.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            titleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            titleLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            
            featureStackView.topAnchor.constraint(equalTo: view.centerYAnchor, constant: -100),
            featureStackView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 50),
            featureStackView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -50),
            
            continueButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -20),
            continueButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            continueButton.widthAnchor.constraint(equalToConstant: 250),
            continueButton.heightAnchor.constraint(equalToConstant: 60)
        ])
        
        // Add feature views
        featureStackView.addArrangedSubview(createFeatureView(title: "Scan food", description: "Take a picture of your food", image: UIImage(systemName: "camera").unsafelyUnwrapped))
        featureStackView.addArrangedSubview(createFeatureView(title: "Edit ingredients", description: "Choose what ingredients you want to use for a meal", image: UIImage(systemName: "pencil").unsafelyUnwrapped))
        featureStackView.addArrangedSubview(createFeatureView(title: "Recipe Generation", description: "Recipes will be automatically generated from your items", image: UIImage(systemName: "menucard").unsafelyUnwrapped))
    }
    
    private func createFeatureView(title: String, description: String, image: UIImage) -> UIView {
        let containerView = UIView()
        
        let imageView = UIImageView(image: image)
        imageView.tintColor = .systemBlue
        imageView.contentMode = .scaleAspectFit
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = UIFont.systemFont(ofSize: 24, weight: .semibold)
        titleLabel.textAlignment = .center
        
        let descriptionLabel = UILabel()
        descriptionLabel.text = description
        descriptionLabel.font = UIFont.systemFont(ofSize: 18)
        descriptionLabel.textColor = .secondaryLabel
        descriptionLabel.numberOfLines = 0
        descriptionLabel.textAlignment = .center
        
        containerView.addSubview(imageView)
        containerView.addSubview(titleLabel)
        containerView.addSubview(descriptionLabel)
        
        imageView.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        descriptionLabel.translatesAutoresizingMaskIntoConstraints = false
        
        NSLayoutConstraint.activate([
            imageView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            imageView.centerYAnchor.constraint(equalTo: containerView.centerYAnchor),
            imageView.widthAnchor.constraint(equalToConstant: 30),
            imageView.heightAnchor.constraint(equalToConstant: 30),
            
            titleLabel.leadingAnchor.constraint(equalTo: imageView.trailingAnchor, constant: 15),
            titleLabel.topAnchor.constraint(equalTo: containerView.topAnchor),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            
            descriptionLabel.leadingAnchor.constraint(equalTo: titleLabel.leadingAnchor),
            descriptionLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 5),
            descriptionLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            descriptionLabel.bottomAnchor.constraint(equalTo: containerView.bottomAnchor)
        ])
        
        return containerView
    }
    
    private func animateOnboarding() {
        // Initial state
        titleLabel.transform = .identity
        featureStackView.transform = CGAffineTransform(translationX: 0, y: 50)
        continueButton.transform = CGAffineTransform(translationX: 0, y: 50)
        
        // Show app name
        UIView.animate(withDuration: 0.5, delay: 0, options: .curveEaseIn) {
            self.titleLabel.alpha = 1
        } completion: { _ in
            // Move app name to top
            UIView.animate(withDuration: 0.5, delay: 1.0, options: .curveEaseInOut) {
                self.titleLabel.transform = CGAffineTransform(translationX: 0, y: -self.view.bounds.height / 4)
            } completion: { _ in
                
                let animation: CATransition = CATransition()
                animation.timingFunction = CAMediaTimingFunction(name: CAMediaTimingFunctionName.easeInEaseOut)
                animation.type = CATransitionType.fade
                animation.subtype = CATransitionSubtype.fromBottom
                animation.duration = 1
                self.titleLabel.layer.add(animation, forKey: "kCATransitionFade")
                
                UIView.animate(withDuration: 1.0, delay: 0, usingSpringWithDamping: 0.8, initialSpringVelocity: 0.5, options: .curveEaseInOut) {
                    self.titleLabel.text = "EyeCook"
                    self.featureStackView.alpha = 1
                    self.featureStackView.transform = .identity
                }
                
                // Animate feature views
                for (index, featureView) in self.featureStackView.arrangedSubviews.enumerated() {
                    featureView.transform = CGAffineTransform(translationX: 0, y: 50)
                    UIView.animate(withDuration: 0.8, delay: 0.2 + Double(index) * 0.2, usingSpringWithDamping: 0.7, initialSpringVelocity: 0.5, options: .curveEaseInOut) {
                        featureView.transform = .identity
                    }
                }
                
                // Animate continue button
                UIView.animate(withDuration: 0.8, delay: 1.0, usingSpringWithDamping: 0.7, initialSpringVelocity: 0.5, options: .curveEaseInOut) {
                    self.continueButton.alpha = 1
                    self.continueButton.transform = .identity
                }
            }
        }
    }
}

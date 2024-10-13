//
//  ImageProcessingController.swift
//  SavorSnap
//
//  Created by Ryan Nair on 10/12/24.
//

import UIKit

struct ImageUploadRequest: Encodable {
    let image: String
}

struct IngredientResponse: Codable {
    let data: [String]
}

extension UIColor {
    static func random() -> UIColor {
        return UIColor(red: .random(in: 0...1),
                       green: .random(in: 0...1),
                       blue: .random(in: 0...1),
                       alpha: 1.0)
    }
}

class ImageProcessingViewController: UIViewController {
    
    private let image: UIImage
    private let imageView = UIImageView()
    private let loadingLabel = UILabel()
    private let gradientLayer = CAGradientLayer()
    private var ingredientTableView: UITableView!
    private var dataSource: UITableViewDiffableDataSource<Section, String>!
    private let continueButton = UIButton(type: .system)
    
    private let ingredientsLabel: UILabel = {
        let label = UILabel()
        label.text = "Ingredients"
        label.font = UIFont.boldSystemFont(ofSize: 48)
        label.textColor = .white
        label.textAlignment = .center
        label.alpha = 0 // Start with alpha 0 for animation
        return label
    }()
    
    private enum Section {
        case main
    }
    
    init(image: UIImage) {
        self.image = image
        super.init(nibName: nil, bundle: nil)
        self.title = "Ingredients"
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupView()
        setupNavigationBar()
        setupTableView()
        setupContinueButton()
        
        processImage()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        animateImage()
        animateLoadingText()
        animateGradient()
    }
    
    private func setupView() {
        view.backgroundColor = .black
        
        // Setup gradient layer
        gradientLayer.frame = view.bounds
        gradientLayer.colors = [UIColor.random().cgColor, UIColor.random().cgColor]
        gradientLayer.locations = [0.0, 1.0]
        view.layer.insertSublayer(gradientLayer, at: 0)
        
        // Setup image view
        imageView.image = image
        imageView.contentMode = .scaleAspectFit
        imageView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(imageView)
        
        // Setup loading label
        loadingLabel.text = "Processing image for recipes"
        loadingLabel.textColor = .white
        loadingLabel.textAlignment = .center
        loadingLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(loadingLabel)
        
        NSLayoutConstraint.activate([
            imageView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            imageView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            imageView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.8),
            imageView.heightAnchor.constraint(equalTo: view.heightAnchor, multiplier: 0.5),
            
            loadingLabel.topAnchor.constraint(equalTo: imageView.bottomAnchor, constant: 20),
            loadingLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            loadingLabel.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.8)
        ])
        
        ingredientsLabel.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(ingredientsLabel)

            NSLayoutConstraint.activate([
                ingredientsLabel.topAnchor.constraint(equalTo: view.topAnchor, constant: 200),
                ingredientsLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor)
        ])
        
        // Initially set alpha to 0 for animation
        imageView.alpha = 0
        loadingLabel.alpha = 0
    }
    
    private func setupNavigationBar() {
        navigationController?.interactivePopGestureRecognizer?.delegate = self
    }
    
    private func setupTableView() {
        ingredientTableView = UITableView(frame: .zero, style: .insetGrouped)
        ingredientTableView.translatesAutoresizingMaskIntoConstraints = false
        ingredientTableView.backgroundColor = .clear
        view.addSubview(ingredientTableView)
        
        NSLayoutConstraint.activate([
            ingredientTableView.topAnchor.constraint(equalTo: ingredientsLabel.bottomAnchor, constant: 100),
            ingredientTableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            ingredientTableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            ingredientTableView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -50)
        ])
        
        ingredientTableView.register(UITableViewCell.self, forCellReuseIdentifier: "IngredientCell")
        
        dataSource = UITableViewDiffableDataSource<Section, String>(tableView: ingredientTableView) { (tableView, indexPath, ingredient) -> UITableViewCell? in
            let cell = tableView.dequeueReusableCell(withIdentifier: "IngredientCell", for: indexPath)
            cell.textLabel?.text = ingredient
            cell.textLabel?.font = UIFont.systemFont(ofSize: 24)
            cell.selectionStyle = .none
            cell.backgroundColor = UIColor.clear.withAlphaComponent(0.25)
            return cell
        }
        
        ingredientTableView.dataSource = dataSource
        ingredientTableView.delegate = self
        
        ingredientTableView.alpha = 0
    }
    
    private func setupContinueButton() {
        continueButton.setTitle("Generate Recipes", for: .normal)
        continueButton.backgroundColor = .systemBlue
        continueButton.setTitleColor(.white, for: .normal)
        continueButton.layer.cornerRadius = 15
        continueButton.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(continueButton)
        
        NSLayoutConstraint.activate([
            continueButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -10),
            continueButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            continueButton.widthAnchor.constraint(equalToConstant: 250),
            continueButton.heightAnchor.constraint(equalToConstant: 100)
        ])
        
        continueButton.addTarget(self, action: #selector(continueButtonTapped), for: .touchUpInside)
        continueButton.alpha = 0
    }
    
    private func processImage() {
        guard let imageData = image.jpegData(compressionQuality: 0.8) else { return }
        let base64String = imageData.base64EncodedString()
        let url = URL(string: "https://eyecookapi.tgm.one/imageUpload").unsafelyUnwrapped
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody = ImageUploadRequest(image: base64String)
        request.httpBody = try! JSONEncoder().encode(requestBody)
        
        Task {
            do {
//                try await Task.sleep(nanoseconds: UInt64(1 * Double(NSEC_PER_SEC)))
//                self.updateIngredients(["one", "two", "three"])
                let data = try await URLSession.shared.data(for: request).0

                let decodedResponse = try JSONDecoder().decode(IngredientResponse.self, from: data)
                await MainActor.run {
                    self.updateIngredients(decodedResponse.data)
                }            
            } catch {
                print("Error: \(error.localizedDescription)")
            }
        }
    }
    
    private func updateIngredients(_ ingredients: [String]) {
        var snapshot = NSDiffableDataSourceSnapshot<Section, String>()
        snapshot.appendSections([.main])
        snapshot.appendItems(ingredients)
        dataSource.apply(snapshot, animatingDifferences: true)
        
        
        let animation: CATransition = CATransition()
        animation.timingFunction = CAMediaTimingFunction(name: CAMediaTimingFunctionName.easeInEaseOut)
        animation.type = CATransitionType.fade
        animation.subtype = CATransitionSubtype.fromTop
        animation.duration = 1
        self.continueButton.layer.add(animation, forKey: "kCATransitionFade")

        UIView.animate(withDuration: 0.5) {
            self.imageView.removeFromSuperview()
            self.loadingLabel.removeFromSuperview()
            self.ingredientTableView.alpha = 1
            self.continueButton.alpha = 1
            self.ingredientsLabel.alpha = 1
            
            self.navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(systemName: "plus"), style: .plain, target: self, action: #selector(self.addIngredient))
        }
    }
    
    private func animateImage() {
        UIView.animate(withDuration: 1.0) {
            self.imageView.alpha = 1.0
        }
    }
    
    private func animateLoadingText() {
        UIView.animate(withDuration: 1.0, delay: 0.5, options: [.repeat, .autoreverse], animations: {
            self.loadingLabel.alpha = 1.0
        }, completion: nil)
    }
    
    private func animateGradient() {
        let animation = CABasicAnimation(keyPath: "colors")
        animation.fromValue = gradientLayer.colors
        animation.toValue = [UIColor.random().cgColor, UIColor.random().cgColor]
        animation.duration = 3.0
        animation.autoreverses = true
        animation.repeatCount = .infinity
        gradientLayer.add(animation, forKey: "gradientAnimation")
    }
    
    @objc private func addIngredient() {
        let alertController = UIAlertController(title: "Add Ingredient", message: nil, preferredStyle: .alert)
        alertController.addTextField { textField in
            textField.placeholder = "Enter ingredient name"
        }
        let addAction = UIAlertAction(title: "Add", style: .default) { [weak self] _ in
            guard let ingredient = alertController.textFields?.first?.text, !ingredient.isEmpty else { return }
            self?.addNewIngredient(ingredient)
        }
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        alertController.addAction(addAction)
        alertController.addAction(cancelAction)
        present(alertController, animated: true, completion: nil)
    }
    
    private func addNewIngredient(_ ingredient: String) {
        var snapshot = dataSource.snapshot()
        snapshot.appendItems([ingredient], toSection: .main)
        dataSource.apply(snapshot, animatingDifferences: true)
    }
    
    @objc private func continueButtonTapped() {
        navigationController?.pushViewController(RecipeProcessingController(ingredients: dataSource.snapshot().itemIdentifiers), animated: true)
    }
    
    @objc private func handleBackSwipe() {
        navigationController?.popViewController(animated: true)
    }
}

extension ImageProcessingViewController: UITableViewDelegate, UIGestureRecognizerDelegate {
    func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
        let deleteAction = UIContextualAction(style: .destructive, title: "Delete") { [weak self] (_, _, completionHandler) in
            self?.deleteIngredient(at: indexPath)
            completionHandler(true)
        }
        return UISwipeActionsConfiguration(actions: [deleteAction])
    }
    
    private func deleteIngredient(at indexPath: IndexPath) {
        var snapshot = dataSource.snapshot()
        if let ingredient = dataSource.itemIdentifier(for: indexPath) {
            snapshot.deleteItems([ingredient])
            dataSource.apply(snapshot, animatingDifferences: true)
        }
    }
}

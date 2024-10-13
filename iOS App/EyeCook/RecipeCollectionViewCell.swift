//
//  RecipeCollectionViewCell.swift
//  EyeCook
//
//  Created by Ryan Nair on 10/13/24.
//

import UIKit

class RecipeCollectionViewCell: UICollectionViewCell {
    static let reuseIdentifier = "RecipeCell"
    
    private let nameLabel = UILabel()
    private let cuisineTypeLabel = UILabel()
    private let allergiesLabel = UILabel()
    private let prepTimeLabel = UILabel()
    private let ingredientsLabel = UILabel()
    private let descriptionLabel = UILabel()
    private let stepsTextView: UITextView = {
        let textView = UITextView()
        textView.isEditable = false
        textView.isScrollEnabled = false // Initially set to false
        textView.translatesAutoresizingMaskIntoConstraints = false
        textView.backgroundColor = .clear
        textView.font = UIFont.systemFont(ofSize: 14)
        return textView
    }()
    
    private var stepsLabelTopConstraint: NSLayoutConstraint?
    private var stepsLabelHeightConstraint: NSLayoutConstraint?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupViews() {
        contentView.backgroundColor = .white.withAlphaComponent(0.25)
        contentView.layer.cornerRadius = 10
        contentView.clipsToBounds = true
        
        [nameLabel, cuisineTypeLabel, allergiesLabel, prepTimeLabel, ingredientsLabel, descriptionLabel, stepsTextView].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
            contentView.addSubview($0)
        }
        
        nameLabel.font = UIFont.boldSystemFont(ofSize: 18)
        
        NSLayoutConstraint.activate([
            nameLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 10),
            nameLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 10),
            nameLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -10),
            
            cuisineTypeLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 5),
            cuisineTypeLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 10),
            
            allergiesLabel.topAnchor.constraint(equalTo: cuisineTypeLabel.bottomAnchor, constant: 5),
            allergiesLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 10),
            
            prepTimeLabel.topAnchor.constraint(equalTo: allergiesLabel.bottomAnchor, constant: 5),
            prepTimeLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 10),
            
            ingredientsLabel.topAnchor.constraint(equalTo: prepTimeLabel.bottomAnchor, constant: 5),
            ingredientsLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 10),
            ingredientsLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -10),
            
            descriptionLabel.topAnchor.constraint(equalTo: ingredientsLabel.bottomAnchor, constant: 5),
            descriptionLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 10),
            descriptionLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -10),
            
            stepsTextView.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 5),
            stepsTextView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 10),
            stepsTextView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -10),
            stepsTextView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -10)
        ])
        
        stepsTextView.isHidden = true
    }
    
    func configure(with recipe: Recipe) {
        nameLabel.text = recipe.name
        cuisineTypeLabel.text = "Cuisine Type: \(recipe.cuisine_type)"
        allergiesLabel.text = "Allergies: \(recipe.allergies)"
        prepTimeLabel.text = "Prep Time: \(recipe.prep_time_minutes) mins"
        ingredientsLabel.text = "Ingredients:\n\(recipe.ingredients.joined(separator: ", "))"
        descriptionLabel.text = recipe.visual_description_caption
        descriptionLabel.numberOfLines = 0
        
        let steps = recipe.instruction_steps.enumerated().map { index, step in
            return "\(index + 1). \(step.step)" + (step.timer_seconds != nil ? " (Timer: \(step.timer_seconds!) seconds)" : "")
        }.joined(separator: "\n")
        
        stepsTextView.text = steps
    }
    
    func toggleStepsVisibility(completion: @escaping () -> Void) {
        let isExpanding = stepsTextView.isHidden
        
        UIView.animate(withDuration: 0.3) {
            self.stepsTextView.isHidden = !isExpanding
        } completion: { _ in
            completion()
        }
    }
}

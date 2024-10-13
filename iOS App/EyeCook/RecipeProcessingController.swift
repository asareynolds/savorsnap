//
//  RecipeProcessingController.swift
//  EyeCook
//
//  Created by Ryan Nair on 10/13/24.
//

import UIKit

struct RecipeResponse: Decodable {
    let result: String
    let data: RecipeData
}

struct RecipeData: Decodable {
    let recipes: [Recipe]
}

struct Recipe: Decodable {
    let allergies: String
    let cuisine_type: String
    let ingredients: [String]
    let instruction_steps: [InstructionStep]
    let name: String
    let prep_time_minutes: Int
    let visual_description_caption: String
}

struct InstructionStep: Decodable {
    let step: String
    let timer_seconds: Int?
}

class RecipeProcessingController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout {
    private let gradientLayer = CAGradientLayer()
    private let ingredients: [String]
    private let loadingLabel = UILabel()
    private var displayLink: CADisplayLink?
    private var waveLayer = CAShapeLayer()
    private var animationProgress: CGFloat = 0
    private var collectionView: UICollectionView!
    private var recipes: [Recipe] = []
    var expandedIndexPaths: Set<IndexPath> = []
    
    init(ingredients: [String]) {
        self.ingredients = ingredients
        super.init(nibName: nil, bundle: nil)
        self.title = "Recipe Details"
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupGradientLayer()
        setupLoadingLabel()
        setupWaveLayer()
        setupCollectionView()
        
        self.title = "Recipe Details"
        
        let url = URL(string: "https://eyecookapi.tgm.one/genRecipe").unsafelyUnwrapped
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody = IngredientResponse(data: ingredients)
        request.httpBody = try! JSONEncoder().encode(requestBody)
        
        Task {
            do {
//                startAnimations()
//                try await Task.sleep(nanoseconds: UInt64(1 * Double(NSEC_PER_SEC)))
//                recipes = sampleRecipeResponse.data.recipes
//                stopAnimations()
//                triggerHapticFeedback()
//                
                let data = try await URLSession.shared.data(for: request).0
                
                print(data)
                
                let recipeResponse = try JSONDecoder().decode(RecipeResponse.self, from: data)
                recipes = recipeResponse.data.recipes
                await MainActor.run {
                    stopAnimations()
                    triggerHapticFeedback()
                }
            } catch {
                print("Error: \(error.localizedDescription)")
            }
        }
    }
    
    private func setupCollectionView() {
        let layout = UICollectionViewFlowLayout()
        layout.scrollDirection = .vertical
        layout.minimumLineSpacing = 20
        layout.minimumInteritemSpacing = 20
        layout.sectionInset = UIEdgeInsets(top: 20, left: 20, bottom: 20, right: 20)
        
        collectionView = UICollectionView(frame: .zero, collectionViewLayout: layout)
        collectionView.backgroundColor = .clear
        collectionView.translatesAutoresizingMaskIntoConstraints = false
        collectionView.delegate = self
        collectionView.dataSource = self
        collectionView.register(RecipeCollectionViewCell.self, forCellWithReuseIdentifier: RecipeCollectionViewCell.reuseIdentifier)
        collectionView.isHidden = true
        
        view.addSubview(collectionView)
        
        NSLayoutConstraint.activate([
            collectionView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            collectionView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            collectionView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            collectionView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
    
    private func setupGradientLayer() {
        gradientLayer.frame = view.bounds
        gradientLayer.colors = [UIColor.random().cgColor, UIColor.random().cgColor]
        gradientLayer.locations = [0.0, 1.0]
        view.layer.insertSublayer(gradientLayer, at: 0)
        
        let colorChangeAnimation = CABasicAnimation(keyPath: "colors")
        colorChangeAnimation.duration = 3.0
        colorChangeAnimation.toValue = [UIColor.random().cgColor, UIColor.random().cgColor]
        colorChangeAnimation.autoreverses = true
        colorChangeAnimation.repeatCount = .infinity
        gradientLayer.add(colorChangeAnimation, forKey: "colorChange")
    }
    
    private func setupLoadingLabel() {
        loadingLabel.text = "Generating Recipes..."
        loadingLabel.font = UIFont.boldSystemFont(ofSize: 24)
        loadingLabel.textColor = .white
        loadingLabel.textAlignment = .center
        loadingLabel.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(loadingLabel)
        
        NSLayoutConstraint.activate([
            loadingLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            loadingLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    
    private func setupWaveLayer() {
        waveLayer.fillColor = UIColor.white.withAlphaComponent(0.3).cgColor
        view.layer.addSublayer(waveLayer)
    }
    
    private func startAnimations() {
        displayLink = CADisplayLink(target: self, selector: #selector(updateAnimations))
        displayLink?.add(to: .main, forMode: .default)
    }
    
    @objc private func updateAnimations() {
        let path = UIBezierPath()
        let width = view.bounds.width
        let height = view.bounds.height
        let midHeight = height * 0.75
        
        path.move(to: CGPoint(x: 0, y: height))
        
        for x in stride(from: 0, to: width, by: 1) {
            let relativeX = x / width
            let y = midHeight + sin(relativeX * .pi * 4 + animationProgress * .pi * 2) * 20
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        path.addLine(to: CGPoint(x: width, y: height))
        path.close()
        
        waveLayer.path = path.cgPath
        
        animationProgress += 0.01
        if animationProgress > 1 {
            animationProgress = 0
        }
    }
    
    private func stopAnimations() {
        waveLayer.removeFromSuperlayer()
        displayLink?.invalidate()
        collectionView.reloadData()
        loadingLabel.isHidden = true
        collectionView.isHidden = false
    }
    
    private func triggerHapticFeedback() {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return recipes.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: RecipeCollectionViewCell.reuseIdentifier, for: indexPath) as! RecipeCollectionViewCell
        cell.configure(with: recipes[indexPath.item])
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        let width = self.collectionView.bounds.width - 40 // Adjust for cell spacing and insets
        var height: CGFloat = 200 // Base height for collapsed cell
        
        if expandedIndexPaths.contains(indexPath) {
            // Calculate expanded height
            let recipe = recipes[indexPath.item]
            let stepsText = recipe.instruction_steps.enumerated().map { index, step in
                return "\(index + 1). \(step.step)" + (step.timer_seconds != nil ? " (Timer: \(step.timer_seconds!) seconds)" : "")
            }.joined(separator: "\n")
            
            let stepsLabel = UILabel()
            stepsLabel.text = stepsText
            stepsLabel.numberOfLines = 0
            stepsLabel.font = UIFont.systemFont(ofSize: 14)
            
            let stepsHeight = stepsLabel.sizeThatFits(CGSize(width: width - 20, height: .greatestFiniteMagnitude)).height
            height += stepsHeight + 10 // Add padding
        }
        
        return CGSize(width: width, height: height)
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        guard let cell = collectionView.cellForItem(at: indexPath) as? RecipeCollectionViewCell else { return }
        
        cell.toggleStepsVisibility { [weak self] in
            guard let self = self else { return }
            
            if self.expandedIndexPaths.contains(indexPath) {
                self.expandedIndexPaths.remove(indexPath)
            } else {
                self.expandedIndexPaths.insert(indexPath)
            }
            
            UIView.animate(withDuration: 0.3) {
                self.collectionView.performBatchUpdates(nil)
            }
        }
    }
}

let sampleRecipeResponse = RecipeResponse(
    result: "success",
    data: RecipeData(
        recipes: [
            Recipe(
                allergies: "dairy",
                cuisine_type: "American",
                ingredients: ["1 lb steak", "4 slices bacon", "1 cup broccoli", "1 cup cheese"],
                instruction_steps: [
                    InstructionStep(step: "Cook bacon until crispy.", timer_seconds: 600),
                    InstructionStep(step: "Season steak with salt and pepper.", timer_seconds: nil),
                    InstructionStep(step: "Sear steak in bacon grease for 3-4 minutes per side.", timer_seconds: nil),
                    InstructionStep(step: "Steam broccoli until tender.", timer_seconds: 480),
                    InstructionStep(step: "Top steak with cheese and serve with broccoli.", timer_seconds: nil)
                ],
                name: "Steak and Broccoli with Cheese",
                prep_time_minutes: 20,
                visual_description_caption: "Juicy steak topped with melted cheese served alongside steamed broccoli."
            ),
            Recipe(
                allergies: "gluten, dairy",
                cuisine_type: "Breakfast",
                ingredients: ["2 eggs", "1/2 cup almond milk", "1/4 cup cheese", "1/2 cup chopped tomatoes", "1/4 cup chopped greens"],
                instruction_steps: [
                    InstructionStep(step: "Whisk eggs and almond milk.", timer_seconds: nil),
                    InstructionStep(step: "Sautee tomatoes and greens in a pan.", timer_seconds: nil),
                    InstructionStep(step: "Pour egg mixture into the pan.", timer_seconds: nil),
                    InstructionStep(step: "Cook until set, then sprinkle with cheese.", timer_seconds: nil)
                ],
                name: "Dairy-Free Omelet",
                prep_time_minutes: 15,
                visual_description_caption: "Fluffy omelet with colorful vegetables and dairy-free cheese."
            ),
            // Add other recipes similarly...
            Recipe(
                allergies: "none",
                cuisine_type: "Snack",
                ingredients: ["1 protein bar", "1 bottle kombucha"],
                instruction_steps: [
                    InstructionStep(step: "Open protein bar wrapper.", timer_seconds: nil),
                    InstructionStep(step: "Open and drink kombucha.", timer_seconds: nil)
                ],
                name: "Protein Bar and Kombucha",
                prep_time_minutes: 2,
                visual_description_caption: "A convenient protein bar paired with a refreshing kombucha drink."
            ),
            Recipe(
                allergies: "none",
                cuisine_type: "Beverage",
                ingredients: ["1 cup juice", "1/2 cup hazelnut milk", "1/4 cup yogurt"],
                instruction_steps: [
                    InstructionStep(step: "Blend all ingredients until smooth.", timer_seconds: nil)
                ],
                name: "Nutty Smoothie",
                prep_time_minutes: 5,
                visual_description_caption: "Creamy and refreshing smoothie with a nutty flavor."
            ),
            Recipe(
                allergies: "dairy",
                cuisine_type: "Breakfast",
                ingredients: ["1 cup coffee", "1/2 cup almond milk"],
                instruction_steps: [
                    InstructionStep(step: "Brew coffee.", timer_seconds: nil),
                    InstructionStep(step: "Heat almond milk.", timer_seconds: nil),
                    InstructionStep(step: "Combine coffee and almond milk.", timer_seconds: nil)
                ],
                name: "Dairy-Free Latte",
                prep_time_minutes: 5,
                visual_description_caption: "A warm and comforting dairy-free latte."
            ),
            Recipe(
                allergies: "gluten",
                cuisine_type: "Salad",
                ingredients: ["2 cups greens", "1/2 cup chopped tomatoes", "1/4 cup chopped carrots", "1/4 cup chopped cauliflower", "1/4 cup cheese"],
                instruction_steps:[
                    InstructionStep(step:"Combine greens, tomatoes, carrots, and cauliflower in a bowl.", timer_seconds:nil),
                    InstructionStep(step:"Top with cheese.", timer_seconds:nil)
                ],
                name:"Gluten-Free Salad with Cheese",
                prep_time_minutes :10,
                visual_description_caption :"A colorful and healthy salad with a variety of vegetables."
             ),
             Recipe(
                 allergies:"none",
                 cuisine_type:"Snack",
                 ingredients:["1 apple","1 lemon"],
                 instruction_steps:[
                    InstructionStep(step:"Slice apple.", timer_seconds:nil),
                    InstructionStep(step:"Squeeze lemon juice over apple slices.", timer_seconds:nil)
                 ],
                 name:"Apple Slices with Lemon",
                 prep_time_minutes :5,
                 visual_description_caption :"Fresh apple slices with a squeeze of lemon to prevent browning."
             ),
             Recipe(
                 allergies:"none",
                 cuisine_type:"Breakfast",
                 ingredients:["2 slices bread","2 eggs","2 slices bacon"],
                 instruction_steps:[
                    InstructionStep(step:"Cook bacon until crispy.",timer_seconds :600),
                    InstructionStep(step:"Fry eggs.",timer_seconds :300),
                    InstructionStep(step:"Toast bread.",timer_seconds :240),
                    InstructionStep(step:"Assemble sandwich with bacon, eggs, and toast.", timer_seconds:nil)
                 ],
                 name:"Bacon and Egg Sandwich",
                 prep_time_minutes :15,
                 visual_description_caption :"Classic breakfast sandwich with crispy bacon and fried eggs."
             ),
             Recipe(
                 allergies:"none",
                 cuisine_type:"Italian",
                 ingredients:["1/2 cup mozzarella cheese","1/2 cup chopped tomatoes","1/4 cup chopped greens"],
                 instruction_steps:[
                    InstructionStep(step:"Combine mozzarella, tomatoes, and greens.",timer_seconds:nil)
                 ],
                 name:"Caprese Salad",
                 prep_time_minutes :5,
                 visual_description_caption :"Simple and refreshing Caprese salad."
             ),
             Recipe(
                 allergies:"none",
                 cuisine_type:"Breakfast",
                 ingredients:["1 cup yogurt","1/2 cup chopped apple","1/4 cup chopped carrot"],
                 instruction_steps:[
                    InstructionStep(step:"Combine yogurt, apple, and carrot.",timer_seconds:nil)
                 ],
                 name:"Yogurt Parfait",
                 prep_time_minutes :5,
                 visual_description_caption :"Healthy and easy yogurt parfait with fruit and vegetables."
             )
         ]
     )
 )

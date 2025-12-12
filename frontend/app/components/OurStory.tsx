// app/components/OurStory.tsx
"use client";

export default function OurStory() {
  const features = [
    {
      icon: '/icons/Traditional-Recipes.png',
      title: 'Traditional Recipes',
      description: 'Passed down through generations, our recipes honor the rich culinary heritage of Sri Lanka, from coastal curries to hill country delicacies.',
      color: 'text-primary-red'
    },
    {
      icon: '/icons/Fresh-Ingredients.png',
      title: 'Fresh Local Ingredients',
      description: 'Daily market-fresh produce, aromatic curry leaves, and authentic spices create the vibrant flavors that define true Sri Lankan cuisine.',
      color: 'text-success-green'
    },
    {
      icon: '/icons/Cultural-Heritage.png',
      title: 'Cultural Heritage',
      description: 'Experience the warmth of Sri Lankan hospitality and the artistry of our traditional cooking methods in every dish we serve.',
      color: 'text-primary-gold'
    }
  ];

  return (
    <section id="story" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-text-dark mb-4">
            Our Story
          </h2>
          <p className="text-xl text-text-dark/70 max-w-2xl mx-auto">
            Bringing authentic Sri Lankan flavors to your table since 1998
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-gold/10 flex items-center justify-center mx-auto mb-6">
                    <img src={feature.icon} alt={feature.title} className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-text-dark mb-4">
                {feature.title}
              </h3>
              <p className="text-text-dark/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
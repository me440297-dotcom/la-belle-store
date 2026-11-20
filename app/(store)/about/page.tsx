import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        
        {/* الجزء النصي */}
        <div className="md:w-1/2">
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Our Story</h1>
          <p className="text-gray-600 leading-relaxed mb-6">
            Welcome to La Béllé, your ultimate destination for elegant and timeless women's fashion. 
            Founded with a passion for style and quality, we believe that every woman deserves to feel 
            confident and beautiful in what she wears.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            We carefully curate our collections to bring you the latest trends alongside classic pieces 
            that never go out of style. From chic dresses to everyday essentials, our pieces are designed 
            to empower you to express your unique personality.
          </p>
          <p className="text-gray-600 leading-relaxed">
            At La Béllé, fashion is more than just clothing—it's a form of self-expression. 
            Thank you for choosing us to be a part of your style journey.
          </p>
        </div>

        {/* الجزء الخاص بالصورة */}
        <div className="md:w-1/2 relative h-[500px] w-full bg-brand-beige-light">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop" 
            alt="About La Belle" 
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </div>
  );
}
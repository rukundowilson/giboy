"use client"
// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState,useEffect, use } from 'react';
import styles from './page.module.css'; 
import Login from '@/app/login/page';
import { useRouter } from 'next/navigation';
import Toast from '../components/toast';
import { isUserLoggedIn } from "@/app/utils/session";

if (isUserLoggedIn()) {
  console.log("User is logged in ✅");
} else {
  console.log("User is NOT logged in ❌");
}

interface CategoryProps {
  title: string;
  image: string;
  link: string;
}

interface imagesStore {
  pic2: "images/new-born.jpeg"
}
const Category: React.FC<CategoryProps> = ({ title, image, link }) => {
  
  return (
    <div className={styles.categoryCard}>
      <div className={styles.categoryImageContainer}>
        <Image 
          src={image} 
          alt={title} 
          layout="fill" 
          objectFit="cover"
          className={styles.categoryImage}
        />
      </div>
      <h3>{title}</h3>
      <Link href={link} className={styles.categoryLink}>
         Shop Now
      </Link>
    </div>
  );
};

interface ProductProps {
  id: number;
  name: string;
  price: number;
  image: string;
  discount?: number;
}

const ProductCard: React.FC<ProductProps> = ({ name, price, image, discount }) => {
  return (
    <div className={styles.productCard}>
      <div className={styles.productImageContainer}>
        <Image 
          src={image} 
          alt={name} 
          layout="fill" 
          objectFit="cover"
          className={styles.productImage}
        />
        {discount && <span className={styles.discountBadge}>{discount}% OFF</span>}
      </div>
      <h3>{name}</h3>
      <div className={styles.priceContainer}>
        {discount ? (
          <>
            <span className={styles.originalPrice}>${price.toFixed(2)}</span>
            <span className={styles.discountedPrice}>${(price * (1 - discount / 100)).toFixed(2)}</span>
          </>
        ) : (
          <span className={styles.price}>${price.toFixed(2)}</span>
        )}
      </div>
      <button className={styles.addToCartButton}>Add to Cart</button>
    </div>
  );
};

interface User{
  email : string
}

export default function MainPage(){
  const [email, setEmail] = useState('');
  const router = useRouter();
  const [user,setUser] = useState<User>({ email: '' })
  

  useEffect(() => {
      if (!isUserLoggedIn){
        router.push('/login')
      }
      const userData = localStorage?.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : { email: '' };
      setUser(userData);
    }, []);
  
  const goTo = function(){
    router.push('/login')
  }
   
  const categories = [
    { title: 'Newborn Essentials', image: '/images/new-born.jpeg', link: '/category/newborn' },
    { title: 'Toddler Fashion', image: '/images/toddler.jpeg', link: '/category/toddler' },
    { title: 'Baby Accessories', image: '/images/accessories.jpeg', link: '/category/accessories' },
  ];

  const featuredProducts = [
    { id: 1, name: 'Organic Cotton Onesie', price: 24.99, image: '/images/onesie.jpeg', discount: 15 },
    { id: 2, name: 'Soft Baby Blanket', price: 29.99, image: '/images/blanket.jpeg' },
    { id: 3, name: 'Cute Animal Socks Set', price: 12.99, image: '/images/socks.jpeg', discount: 10 },
    { id: 4, name: 'Baby Beanie Hat', price: 14.99, image: '/images/beanie.jpeg' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Giboy | Adorable Baby Clothing</title>
        <meta name="description" content="Premium quality baby clothes and accessories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            Giboy
          </div>
          <nav className={styles.navigation}>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/collections">Collections</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
          <div className={styles.headerActions}>
            <button className={styles.headerActionButton}>
              <span className={styles.srOnly}>Search</span>
              🔍
            </button>
            <button onClick={goTo
            
            } className={styles.headerActionButton}>
              <span className={styles.srOnly}>Account</span>
              👤{Object.keys(user).length>0 &&(
                user?.email
              )}
            </button>
            <button className={styles.headerActionButton}>
              <span className={styles.srOnly}>Cart</span>
              🛒
            </button>
          </div>
        </div>
        {isUserLoggedIn()&&(
           <Toast message = {"you logged in"} />
        )}
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Adorable Clothes for Your Little Ones</h1>
            <p>Premium quality, comfortable, and stylish baby clothing that grows with your child</p>
            <div className={styles.heroButtons}>
              <Link href="/shop" className={styles.primaryButton}>
                Shop Now
              </Link>
              <Link href="/collections/new" className={styles.secondaryButton}>
                View New Arrivals
              </Link>

            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <Image 
              src="/images/pic1.jpeg"
              alt="Happy baby with giboy easy order"
              width={600} 
              height={400} 
              className={styles.heroImage}
            />
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🚚</div>
            <h3>Free Shipping</h3>
            <p>On all orders over $50</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🔄</div>
            <h3>Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🌱</div>
            <h3>Organic Materials</h3>
            <p>Safe for sensitive skin</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🔒</div>
            <h3>Secure Payment</h3>
            <p>100% secure checkout</p>
          </div>
        </section>

        <section className={styles.categories}>
          <h2>Shop by Category</h2>
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <Category key={index} {...category} />
            ))}
          </div>
        </section>

        <section className={styles.featuredProducts}>
          <h2>Featured Products</h2>
          <div className={styles.productGrid}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          <div className={styles.viewAllContainer}>
            <Link href="/shop" className={styles.viewAllButton}>
              View All Products
            </Link>

          </div>
        </section>

        <section className={styles.testimonials}>
          <h2>What Parents Say</h2>
          <div className={styles.testimonialGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                "The quality of Giboy clothes is amazing! My baby's skin is very sensitive, and these are the only clothes that don't cause irritation."
              </div>
              <div className={styles.testimonialAuthor}>- Sarah M., Mother of twins</div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                "I love how durable these clothes are. Even after multiple washes, they look brand new. Definitely worth every penny!"
              </div>
              <div className={styles.testimonialAuthor}>- James P., Father of a toddler</div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                "The designs are so cute and unique. I always get compliments on my daughter's outfits from Giboy."
              </div>
              <div className={styles.testimonialAuthor}>- Emma L., Mother of a 1-year-old</div>
            </div>
          </div>
        </section>

        <section className={styles.newsletter}>
          <h2>Join Our Newsletter</h2>
          <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Your email address" 
              required 
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.newsletterButton}>Subscribe</button>
          </form>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <h3>Giboy</h3>
            <p>Premium quality baby clothes made with love and care for your little ones.</p>
          </div>
          <div className={styles.footerColumn}>
            <h3>Quick Links</h3>
            <ul>
            <li><Link href="/shop">Shop All</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>

            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Customer Service</h3>
            <ul>
              <li><Link href="/shipping">Shipping & Returns</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/sizing">Size Guide</Link></li>
            </ul>

          </div>
          <div className={styles.footerColumn}>
            <h3>Follow Us</h3>
            <div className={styles.socialLinks}>
              <a href="https://instagram.com" className={styles.socialLink}>Instagram</a>
              <a href="https://facebook.com" className={styles.socialLink}>Facebook</a>
              <a href="https://pinterest.com" className={styles.socialLink}>Pinterest</a>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} Giboy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
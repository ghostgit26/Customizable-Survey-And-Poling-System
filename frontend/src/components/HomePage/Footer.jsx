import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin } from "lucide-react";

const SurveySpherePage = () => {
 return (
   <div className="d-flex flex-column bg-dark text-white">
     {/* Footer */}
     <footer className="py-5 border-top border-secondary">
       <div className="container">
         <div className="row gy-4">
           {/* Logo and copyright */}
           <div className="col-md-3">
             <h5 className="fw-medium text-white">Survey Sphere</h5>
             <p className="text-secondary small mb-1">
               ©{new Date().getFullYear()} SurveySphere Inc.
             </p>
             <div className="d-flex gap-2">
               <Link to="/terms" className="text-secondary small text-decoration-none">
                 Terms of Service
               </Link>
               <span className="text-secondary">|</span>
               <Link to="/privacy" className="text-secondary small text-decoration-none">
                 Privacy Policy
               </Link>
             </div>
           </div>

           {/* Products */}
           <div className="col-md-3">
             <h6 className="fw-medium mb-3 text-white">Products</h6>
             <ul className="list-unstyled small">
               <li><Link to="/product" className="text-secondary text-decoration-none">Product</Link></li>
               <li><Link to="/pricing" className="text-secondary text-decoration-none">Overview</Link></li>
               <li><Link to="/login" className="text-secondary text-decoration-none">Surveys</Link></li>
               <li><Link to="/request-access" className="text-secondary text-decoration-none">Online forms</Link></li>
               <li><Link to="/partnerships" className="text-secondary text-decoration-none">Pricing</Link></li>
             </ul>
           </div>

           {/* About us */}
           <div className="col-md-3">
             <h6 className="fw-medium mb-3 text-white">About us</h6>
             <ul className="list-unstyled small">
               <li><Link to="/about" className="text-secondary text-decoration-none">About Survey Sphere</Link></li>
               <li><Link to="/contact" className="text-secondary text-decoration-none">Contact us</Link></li>
               <li><Link to="/features" className="text-secondary text-decoration-none">Features</Link></li>
               <li><Link to="/careers" className="text-secondary text-decoration-none">Careers</Link></li>
             </ul>
           </div>

           {/* Resources */}
           <div className="col-md-3">
             <h6 className="fw-medium mb-3 text-white">Resources</h6>
             <ul className="list-unstyled small">
               <li><Link to="/help" className="text-secondary text-decoration-none">Help center</Link></li>
               <li><Link to="/book-demo" className="text-secondary text-decoration-none">Customers</Link></li>
               <li><Link to="/server-status" className="text-secondary text-decoration-none">Resource center</Link></li>
               <li><Link to="/blog" className="text-secondary text-decoration-none">Blog</Link></li>
             </ul>
             <div className="mt-3 d-flex gap-3">
               <a href="https://facebook.com" className="text-secondary" aria-label="Facebook">
                 <Facebook size={20} />
               </a>
               <a href="https://twitter.com" className="text-secondary" aria-label="Twitter">
                 <Twitter size={20} />
               </a>
               <a href="https://linkedin.com" className="text-secondary" aria-label="LinkedIn">
                 <Linkedin size={20} />
               </a>
             </div>
           </div>
         </div>
       </div>
     </footer>
   </div>
 );
};

export default SurveySpherePage;
 
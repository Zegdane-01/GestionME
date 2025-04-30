import React from 'react';
import ilham from '../../../../assets/images/leadership/Ilham_megouaz.jpg'; 
function Quote_Ilham() {
  return (
    <section className="lead-quote py-6 bg-dark">
        <div className="container">
            <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8 text-center">
                <div className="card border-0 bg-transparent">
                <div className="card-body">
                    <blockquote className="blockquote mb-4 position-relative">
                    <p className="fs-4 text-white opacity-85 mb-4">
                        "We deliver confidence and excellence by combining diverse expertise, 
                        innovative solutions, and a commitment to reliability, ensuring optimal 
                        performance and efficiency throughout the product lifecycle."
                    </p>
                    <div className="separator-line mx-auto bg-primary mb-4"></div>
                    <div className="d-flex align-items-center justify-content-center gap-4">
                        <img 
                        src={ilham} 
                        alt="Itham MEGOUAZ" 
                        className="rounded-circle shadow"
                        style={{ 
                            width: '90px', 
                            height: '90px', 
                            objectFit: 'cover',
                            border: '3px solid #0d6efd'
                        }}
                        />
                        <div className="text-start">
                        <h5 className="mb-1 text-white fw-bold">Ilham MEGOUAZ</h5>
                        <p className="mb-0 text-light">Country Lead ME</p>
                        <p className="mb-0 text-light small">Morocco</p>
                        </div>
                    </div>
                    </blockquote>
                </div>
                </div>
            </div>
            </div>
        </div>
    </section>);
}
export default Quote_Ilham;
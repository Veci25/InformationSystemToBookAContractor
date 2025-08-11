import { Link } from "react-router-dom";

const Home = () => {
  const token = localStorage.getItem("token");
  const ctaTo = token ? "/dashboard" : "/login";

  return (
    <div className="container my-5">
      <div className="p-5 bg-light rounded-3">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <h1 className="display-5 fw-bold">
              <span role="img" aria-label="crane">🏗️</span> Welcome to <span className="text-primary">ContractMe</span>
            </h1>
            <p className="lead mt-3">
              Your trusted platform to connect clients with professional contractors.
              Post jobs, hire skilled experts, and get work done efficiently.
            </p>
            <Link to={ctaTo} className="btn btn-lg btn-primary hero-cta mt-2">
              Get started
            </Link>
          </div>
          <div className="col-lg-5 text-center">
            <img src="https://cdn-icons-png.flaticon.com/512/993/993928.png" alt="Illustration"
                 style={{ maxWidth: "280px", opacity: 0.9 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

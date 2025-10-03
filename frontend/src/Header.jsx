import "./DashboardPage.css";
import { useState, useEffect } from "react";
import { FaRegBell } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Add Comic Neue font
const fontStyles = `
@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Oswald:wght@200..700&display=swap');
:root {
  --font-comic: 'Comic Neue', cursive;
}
.comic-neue-light {
  font-family: "Comic Neue", cursive;
  font-weight: 300;
  font-style: normal;
}

.comic-neue-regular {
  font-family: "Comic Neue", cursive;
  font-weight: 400;
  font-style: normal;
}

.comic-neue-bold {
  font-family: "Comic Neue", cursive;
  font-weight: 700;
  font-style: normal;
}

.comic-neue-light-italic {
  font-family: "Comic Neue", cursive;
  font-weight: 300;
  font-style: italic;
}

.comic-neue-regular-italic {
  font-family: "Comic Neue", cursive;
  font-weight: 400;
  font-style: italic;
}

.comic-neue-bold-italic {
  font-family: "Comic Neue", cursive;
  font-weight: 700;
  font-style: italic;
}



body {
  font-family: var(--font-comic);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-comic);
}

/* Header Styles */
.dashboard-header {
  padding: 1em 3rem;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.header-title {
  margin: 0;
  font-size: 1.5rem;
}

.profile-section {
  display: flex;
  align-items: center;
}

.profile-icon {
  width: 195px;
  height: auto;
  max-height: 130px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.icon-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
}

/* Card animations */
.animated-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease-in-out;
}

.animated-card:hover {
  transform: translateY(-5px);
}

/* Button styles */
.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

/* Progress bar styles */
.progress {
  height: 0.5rem;
  background-color: #e9ecef;
}

.progress-bar {
  background-color: #007bff;
}

/* Card styles */
.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 0.5rem 1rem;
  }
  
  .profile-icon {
    max-height: 60px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }
}`;

// Inject styles into the document
const style = document.createElement('style');
style.textContent = fontStyles;
document.head.appendChild(style);

const USER_AVATAR_IMG = "/avatar1.png";

const BellIcon = FaRegBell;
const ArrowDownIcon = IoIosArrowDown;

const Header = () => {
	const [username, setUsername] = useState("");

	useEffect(() => {
		const storedUsername = localStorage.getItem("username");
		if (storedUsername) {
			setUsername(storedUsername);
		}
	}, []);
	return (
		<header className='dashboard-header'>
			<h1 className='header-title'>
				<div className='profile-section'>
					<img
          onClick={() => window.location.href = '/dash'}
						src='/yel_logo.svg'
						alt='Profile'
						className='profile-icon img-fluid'
					/>
				</div>
			</h1>
			<div className='header-actions'>
				<button className='icon-button btn p-2'>
					<BellIcon style={{ fontSize: '1.5rem' }} />
				</button>
				<div className='user-info'>
					<img
						src={USER_AVATAR_IMG}
						alt='User Avatar'
						className='user-avatar rounded-circle'
						style={{ width: '35px', height: '35px' }}
					/>
					<span className='user-name'>{username.toUpperCase() || "Guest"}</span>
					<button className='icon-button btn p-1'>
						<ArrowDownIcon style={{ fontSize: '1.2rem' }} />
					</button>
				</div>
			</div>
		</header>
	);
};

export default Header;
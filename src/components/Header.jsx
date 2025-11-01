import '@/css/Header.css';
import { Link } from 'react-router-dom';

const Header = () => {

    return (
        <header className={`text-center bg-img`}>
            <div className="m-0 p-5 mask">
                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                    <Link to='/' className='text-decoration-none'>
                        <h1 className='header-title m-0 text-white shadowed'>Tu página web</h1>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
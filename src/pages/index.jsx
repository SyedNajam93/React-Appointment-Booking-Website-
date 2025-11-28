import Layout from "./Layout.jsx";

import Home from "./Home";

import BookAppointment from "./BookAppointment";

import Confirmation from "./Confirmation";

import MyAppointments from "./MyAppointments";

import Profile from "./Profile";

import AdminDashboard from "./AdminDashboard";

import AdminAppointments from "./AdminAppointments";

import AdminServices from "./AdminServices";

import AdminStaff from "./AdminStaff";

import AdminCustomers from "./AdminCustomers";

import AdminLocations from "./AdminLocations";

import AdminSettings from "./AdminSettings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    BookAppointment: BookAppointment,
    
    Confirmation: Confirmation,
    
    MyAppointments: MyAppointments,
    
    Profile: Profile,
    
    AdminDashboard: AdminDashboard,
    
    AdminAppointments: AdminAppointments,
    
    AdminServices: AdminServices,
    
    AdminStaff: AdminStaff,
    
    AdminCustomers: AdminCustomers,
    
    AdminLocations: AdminLocations,
    
    AdminSettings: AdminSettings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/BookAppointment" element={<BookAppointment />} />
                
                <Route path="/Confirmation" element={<Confirmation />} />
                
                <Route path="/MyAppointments" element={<MyAppointments />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/AdminAppointments" element={<AdminAppointments />} />
                
                <Route path="/AdminServices" element={<AdminServices />} />
                
                <Route path="/AdminStaff" element={<AdminStaff />} />
                
                <Route path="/AdminCustomers" element={<AdminCustomers />} />
                
                <Route path="/AdminLocations" element={<AdminLocations />} />
                
                <Route path="/AdminSettings" element={<AdminSettings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrganizations } from "../../redux/organization/organizationSlice";
import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";

const OrganizationCard = () => {
    const dispatch = useDispatch();
    const organizations = useSelector((state) => state.organization.organizations);

    useEffect(() => {
        dispatch(getAllOrganizations());
    }, [dispatch]);

    return (
        <div className="organization-card-container">
            <div className="breadcrumbs">
                <FaLink />
                <Link to="/">Home</Link> / <Link to="/manage-organization">Organizations</Link>
            </div>
            
            {organizations.length > 0 ? (
                organizations.map((org) => (
                    <div key={org.id} className="organization-card">
                        <div className="org-header">
                            {org.background && <img src={org.background} alt="Background" className="background-img" />}
                        </div>
                        <div className="org-avatar">
                            {org.avatar ? (
                                <img src={org.avatar} alt="Avatar" className="avatar-img" />
                            ) : (
                                <div className="avatar-placeholder">Avatar</div>
                            )}
                        </div>
                        <div className="org-info">
                            <h3>{org.organizationName}</h3>
                            <p>{org.organizationDescription}</p>
                            <p>Email: {org.email}</p>
                            <p>Phone: {org.phoneNumber}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p>No organizations found.</p>
            )}
        </div>
    );
};

export default OrganizationCard;

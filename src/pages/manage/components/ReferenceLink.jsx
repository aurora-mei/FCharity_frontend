import React from "react";
import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";

const ReferenceLink = ({ link }) => {
  return (
    <div className="pl-2 flex gap-2 ">
      <FaLink />
      {link.length > 0 &&
        link.map((item, index) => {
          return (
            <div key={index} className="inline-flex gap-1 items-baseline">
              <Link to={item.path} className="hover:underline">
                {item.name}
              </Link>
              <span className="text-gray-500">/</span>
            </div>
          );
        })}
    </div>
  );
};

export default ReferenceLink;

import React from 'react'
import { Link } from 'react-router-dom';
const MenuItem  = ({name, url}) => {
    return(
        <Link to={url}>
            <div className="MenuItem">
                <p>{name}</p>
            </div>
        </Link>
    )
        
    
}
export default MenuItem
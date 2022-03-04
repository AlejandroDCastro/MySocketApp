import React, { useEffect, useState } from 'react';
import './Message.css';

const Message = ({ message: { name, user_id, text, color, fileName }, current_uid, same_user, privacy }) => {
    const [elementDOM, setElementDOM] = useState();

    // Depend on client indentify align messages right or left
    const classNameAlign = (user_id === current_uid) ? 'right-msg' : 'left-msg';
    const classMarginFromLast = same_user ? 'same-user' : 'diff-user';
    const styleClasses = classNameAlign + ' ' + classMarginFromLast;
    const display = (styleClasses === 'left-msg diff-user' && privacy === 'Shared') ? 'flex' : 'none';
    const nameStyle = {
        color: color,
        display: display
    };

    const displayMessage = _ => {
        if (fileName) {

            // Extract the content type
            const contentType = text.slice(5, text.length).split(';')[0];
            
            // Fetch API used to convert base64 to blob
            fetch(text)
                .then(response => {
                    return response.blob();
                })
                .then(blob => {
                    const blobURL = URL.createObjectURL(blob);

                    switch (contentType) {
                        case 'audio/webm':
                        case 'audio/mpeg':
                            setElementDOM(
                                <audio controls='controls'>
                                    <source src={blobURL} type={contentType} />
                                </audio>
                            );
                            break;
                    
                        case 'image/png':
                        case 'image/jpeg':
                            setElementDOM(<img src={blobURL} alt={fileName} />);
                            break;

                        default:

                            // Load and unknown file ready to download
                            setElementDOM(<a href={blobURL} download={fileName}>{fileName}</a>);
                            break;
                    }
                });

        } else {
            
            // Set as plain text
            setElementDOM(<p>{text}</p>);
        }
    }

    useEffect(() => {
        displayMessage();
    }, [])
    

    return (
        <div className={styleClasses}>
            <div>
                <p style={nameStyle}>{name}</p>
                {elementDOM}
            </div>
        </div>
    )
}

export default Message;

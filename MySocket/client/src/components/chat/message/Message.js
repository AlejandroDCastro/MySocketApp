import React, { useEffect, useState } from 'react';
import './Message.css';

const Message = ({ message: { name, user_id, text, type, color }, current_uid, same_user, privacy }) => {
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
        switch (type) {
            case 'text':
                setElementDOM(<p>{text}</p>);
                break;
        
            case 'audio/webm':

                // Fetch API used to convert base64 to blob
                fetch(`data:${type};base64,${text}`)
                    .then(response => {
                        return response.blob();
                    })
                    .then(blob => {
                        setElementDOM(
                            <audio controls='controls'>
                                <source src={URL.createObjectURL(blob)} type={type} />
                            </audio>
                        );
                    });
                break;

            default:
                console.log('File is not displayed yet!!!');
                setElementDOM(<p>{text}</p>);
                break;
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

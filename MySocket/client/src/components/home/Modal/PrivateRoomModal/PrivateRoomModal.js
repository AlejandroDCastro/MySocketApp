import React, { useEffect } from 'react';
import '../Modal.css';


const PrivateRoomModal = ({ privateParams: { handleSubmitPrivateRoom, privateRoom, changePrivateRoomValue, privateRoomError, setOpenPrivateModal } }) => {

    useEffect(() => {
        let inputDiv = document.querySelector('#add-new-user>div>div>section>form>div:first-child');

        if (inputDiv) {
            if (privateRoom !== '') {
                inputDiv.classList.replace('labelDown', 'labelUp');
            } else {
                inputDiv.classList.replace('labelUp', 'labelDown');
            }
        }
    }, [privateRoom]);


    return (
        <div id="add-new-user" className='pop-up'>
            <div>
                <p onClick={() => setOpenPrivateModal(false)}><i class="fas fa-times"></i></p>
                <div>
                    <section>
                        <h2>Add new user</h2>
                        <form onSubmit={handleSubmitPrivateRoom}>
                            <div className="inputData labelDown">
                                <input type="email" id="privateRoom" required value={privateRoom} onChange={changePrivateRoomValue} />
                                <label htmlFor="privateRoom">Enter a user email</label>
                                <p className='error-msg'>{privateRoomError}</p>
                            </div>
                            <input className='button-effect' type="submit" value="Open chat" />
                        </form>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default PrivateRoomModal;
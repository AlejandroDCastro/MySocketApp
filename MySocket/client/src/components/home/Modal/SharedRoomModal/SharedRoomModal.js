import React, { useEffect } from 'react';
import '../Modal.css';


const SharedRoomModal = ({ sharedParams: { handleSubmitSharedRoom, handleSubmitGroupMembers, sharedRoom, groupMember, setSharedRoom, setGroupMember, setGroupMembers, sharedRoomError, groupMemberError, setSharedRoomError, setGroupMemberError,setOpenSharedModal, clearUsersFromList } }) => {

    useEffect(() => {
        let inputDiv = document.querySelector('#group-name>form>div:first-child');

        if (inputDiv) {
            if (sharedRoom !== '') {
                inputDiv.classList.replace('labelDown', 'labelUp');
            } else {
                inputDiv.classList.replace('labelUp', 'labelDown');
            }
        }
    }, [sharedRoom]);

    useEffect(() => {
        let inputDiv = document.querySelector('#group-list>form>div:first-child');

        if (inputDiv) {
            if (groupMember !== '') {
                inputDiv.classList.replace('labelDown', 'labelUp');
            } else {
                inputDiv.classList.replace('labelUp', 'labelDown');
            }
        }
    }, [groupMember]);

    const changeSharedRoomValue = e => {
        setSharedRoom(e.target.value);
    }

    const changeGroupMemberValue = e => {
        setGroupMember(e.target.value);
    }

    const closeModal = _ => {
        setGroupMemberError('');
        setSharedRoomError('');
        setGroupMember('');
        setGroupMembers([]);
        setSharedRoom('');
        clearUsersFromList();
        setOpenSharedModal(false);
    }


    return (
        <div id="add-new-group" className='pop-up modal-fade-in'>
            <div>
                <p onClick={closeModal}><i className="fas fa-times"></i></p>
                <div>
                    <section id='group-name'>
                        <h2>Type group name</h2>
                        <form onSubmit={handleSubmitSharedRoom}>
                            <div className="inputData labelDown">
                                <input type="text" id="sharedRoom" required value={sharedRoom} onChange={changeSharedRoomValue} />
                                <label htmlFor="sharedRoom">Enter a room name</label>
                                <p className='error-msg'>{sharedRoomError}</p>
                            </div>
                            <input className='button-effect' type="submit" value="Open chat" />
                        </form>
                    </section>
                    <hr size='1' />
                    <hr size='1' />
                    <hr size='1' />
                    <hr size='1' />
                    <hr size='1' />
                    <section id="group-list">
                        <h2>Add users</h2>
                        <form onSubmit={handleSubmitGroupMembers}>
                            <div className="inputData labelDown">
                                <input type="email" id="groupMember" required value={groupMember} onChange={changeGroupMemberValue} />
                                <label htmlFor="groupMember">Enter a user email</label>
                                <p className='error-msg'>{groupMemberError}</p>
                            </div>
                            <input className='button-effect' type="submit" value="Add user" />
                        </form>
                        <div>
                            <p>User list</p>
                            <ul>
                                <li>No users at the moment...</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default SharedRoomModal;
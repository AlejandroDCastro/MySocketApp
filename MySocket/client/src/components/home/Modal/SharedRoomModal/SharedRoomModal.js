import React from 'react';

const SharedRoomModal = () => {
    return (
        <div>
            <section id="add-new-group">
                <div>
                    <h2>Add new group</h2>
                    <form onSubmit={handleSubmitSharedRoom}>
                        <div className="inputData labelDown">
                            <input type="text" id="sharedRoom" required value={sharedRoom} onChange={changeSharedRoomValue} />
                            <label htmlFor="sharedRoom">Enter a room name</label>
                            <p>{sharedRoomError}</p>
                        </div>
                        <input type="submit" value="Open chat" />
                    </form>
                </div>
            </section>
            <div id="group-list">
                <div>
                    <form onSubmit={handleSubmitGroupMembers}>
                        <div className="inputData labelDown">
                            <input type="email" id="groupMember" required value={groupMember} onChange={changeGroupMemberValue} />
                            <label htmlFor="groupMember">Enter a user email</label>
                            <p>{groupMemberError}</p>
                        </div>
                        <input type="submit" value="ADD USER" />
                    </form>
                    <p>User list:</p>
                    <ul>
                        <li>No users at the moment...</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default SharedRoomModal;
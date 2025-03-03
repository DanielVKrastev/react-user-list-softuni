import { useEffect, useState } from "react";

import userService from "../services/userService";

import Pagination from "./Pagination";
import Search from "./Search";
import UserListItem from "./UserListItem";
import UserCreate from "./UserCreate";
import UserInfo from "./UserInfo";
import UserDelete from "./UserDelete";
import Error from "./Error";

import { sortingUsers } from "../utils/sortingUsers";
import { pagination } from "../utils/paginationUtils";


export default function UserList() {
    const [users, setUsers] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [userIdInfo, setUserIdInfo] = useState(null); // or undefiend
    const [userIdDelete, setUserIdDelete] = useState(null);
    const [searchParams, setSearchParams] = useState([]);
    const [sorting, setSorting] = useState({sortName: 'createdAt', sort: 'ASC'});
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [pages, setPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isPending, setIsPending] = useState(true); // for loading spinner
    const [errorMessage, setErrorMessage] = useState(false); // for loading spinner

    /*
    useEffect(() => {
        userService.getAll()
            .then(result => {
                setUsers(result);
            });
    }, []);
    */

    useEffect(() => {
        setIsPending(true);
        setErrorMessage(false);
        if(! searchParams.search) {

            userService.getAll()
            .then(result => {
                setIsPending(false);
                const sortedResult = sortingUsers(result, sorting.sortName, sorting.sort);

                if(sortedResult.length !== 0){
                    const slicesArraysResult = pagination(sortedResult, itemsPerPage);

                    setPages(slicesArraysResult.length); //All pages
                    
                    setUsers(slicesArraysResult[currentPage - 1]);  
                }else{
                    setUsers([]);
                    setErrorMessage("There is no users yet.");
                }   
            })
            .catch(err => {
                setIsPending(false);
                setErrorMessage('Failed to fetch');
            });
            return;
        }

        // Searching
        userService.getAll()
            .then(result => {
                setIsPending(false);
                const search = searchParams.search;
                const criteria = searchParams.criteria;
                if(criteria === 'not selected') return;

                const findUser = result.filter(user => user[criteria].toLowerCase() === search.toLowerCase());
                const sortedResult = sortingUsers(findUser, sorting.sortName, sorting.sort);

                if(sortedResult.length !== 0){
                    const slicesArraysResult = pagination(sortedResult, itemsPerPage);

                    setPages(slicesArraysResult.length); //All pages
                    
                    setUsers(slicesArraysResult[currentPage - 1]);  
                }else{
                    setUsers([]);
                    setErrorMessage("Sorry, we couldn't find what you're looking for.");
                }
  
            })
            .catch(err => {
                setIsPending(false);
                setErrorMessage('Failed to fetch');
            });
            
    }, [searchParams, sorting, itemsPerPage, currentPage]);

    const createUserClickHandler = () => {
        setShowCreate(true);
    };

    const closeCreateUserClickHandler = () => {
        setShowCreate(false);
        setEditUserId(null);
    };

    const saveCreateUserClickHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData);  
        
        // post request to server
        const newUser = await userService.create(userData);
        
        // update local state
        setUsers(state => [...state, newUser]); //render

        // finally close modal
        setShowCreate(false);
    };

    const userInfoClickHandler = (userId) => {
        setUserIdInfo(userId);
    };

    const userInfoCloseHandler = () => {
        setUserIdInfo(null);
    };

    const userDeleteClickHandler = (userId) => {
        setUserIdDelete(userId);
    };

    const userDeleteCloseHandler = () => {
        setUserIdDelete(null);
    };

    const userDeleteHandler = async () => {
        // DELETE request to server
        await userService.delete(userIdDelete);

        // Delete from locale state
        setUsers(state => state.filter(user => user._id !== userIdDelete));

        // finally close modal
        setUserIdDelete(null);
    };

    const userEditClickHandler = (userId) => {
        setShowCreate(true);
        setEditUserId(userId);
    };

    const saveEditUserClickHandler = async (e) => {
        e.preventDefault();
        const userId = editUserId;
        
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData);

        // update user on server
        const updatedUser = await userService.update(userId, userData);

        // update local
        setUsers(state => state.map(user => user._id === userId ? updatedUser : user));

        setShowCreate(false);
    };

    const searchUserClickHandler = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const search = formData.get('search');
        const criteria = formData.get('criteria');

        setSearchParams({search, criteria});
    };

    const sortingUsersHandler = (e) => {
        let sortName = '';
        if(e.target.innerText === 'First name'){
            sortName = 'firstName';
        }else if(e.target.innerText === 'Last name'){
            sortName = 'lastName';
        }else if(e.target.innerText === 'Email'){
            sortName = 'email';
        }else if(e.target.innerText === 'Phone'){
            sortName = 'phoneNumber';
        }else if(e.target.innerText === 'Created'){
            sortName = 'createdAt';
        }

        if(sorting.sortName === sortName){
            sorting.sort === 'ASC' ? 
            setSorting({sortName: sortName, sort: 'DESC'})
            : setSorting({sortName: sortName, sort: 'ASC'});
        }else{
            setSorting({sortName: sortName, sort: 'ASC'});
        }
    };

    const setItemsPerPagePaginationHandler = (e) => {
        setItemsPerPage(e.target.value);
    };

    const changeCurrentPageHandler = (page) => {
        setCurrentPage(page);
    };    

    return(
        <>
            {/*<!-- Section component  -->*/}
    <section className="card users-container">
        <Search 
            onSearch={searchUserClickHandler}
        />

        {showCreate && 
            <UserCreate 
                userId={editUserId}
                onClose={closeCreateUserClickHandler}
                onSave={saveCreateUserClickHandler}
                onEdit={saveEditUserClickHandler}
            /> }

        {userIdInfo && 
            <UserInfo 
                userId={userIdInfo}
                onClose={userInfoCloseHandler}
            /> }

        {userIdDelete &&
            <UserDelete 
                onClose={userDeleteCloseHandler}
                onDelete={userDeleteHandler}
            /> }

        {/*<!-- Table component -->*/}
        <div className="table-wrapper">
            {/*<!-- Overlap components  -->*/}

            {isPending || errorMessage? <div className="loading-shade">
                {/*<!-- Loading spinner  -->*/}
                {isPending && <div className="spinner"></div>}

                {errorMessage && <Error errorMessage={errorMessage}/> }
            </div>
            : 
            ''}

            <table className="table">
            <thead>
                <tr>
                <th>
                    Image
                </th>
                <th onClick={sortingUsersHandler}>
                    First name
                    <svg aria-hidden="true" focusable="false" data-prefix="fas"
                    data-icon="arrow-down" className={sorting.sortName === 'firstName'? 
                                                                "icon active-icon svg-inline--fa fa-arrow-down Table_icon__+HHgn" 
                                                                : "icon svg-inline--fa fa-arrow-down Table_icon__+HHgn"
                    } role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    {sorting.sort === 'ASC' ?
                                <path fill="currentColor"
                                    d="M374.6 310.6l-160 160C208.4 476.9 200.2 480 192 480s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 370.8V64c0-17.69 14.33-31.1 31.1-31.1S224 46.31 224 64v306.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0S387.1 298.1 374.6 310.6z"
                                />
                                :
                                <path fill="currentColor"
                                    d="M192 32c-10 0-20 4-27.3 11.3l-136 136c-15.6 15.6-15.6 40.9 0 56.6s40.9 15.6 56.6 0L160 142.6V456c0 22.1 17.9 40 40 40s40-17.9 40-40V142.6l74.7 74.7c15.6 15.6 40.9 15.6 56.6 0s15.6-40.9 0-56.6l-136-136C212 36 202 32 192 32z"
                                />
                    }

                    </svg>
                </th>
                <th onClick={sortingUsersHandler}>
                    Last name
                    <svg aria-hidden="true" focusable="false" data-prefix="fas"
                    data-icon="arrow-down" className={sorting.sortName === 'lastName'? 
                                                                "icon active-icon svg-inline--fa fa-arrow-down Table_icon__+HHgn" 
                                                                : "icon svg-inline--fa fa-arrow-down Table_icon__+HHgn"
                    } role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    {sorting.sort === 'ASC' ?
                                <path fill="currentColor"
                                    d="M374.6 310.6l-160 160C208.4 476.9 200.2 480 192 480s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 370.8V64c0-17.69 14.33-31.1 31.1-31.1S224 46.31 224 64v306.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0S387.1 298.1 374.6 310.6z"
                                />
                                :
                                <path fill="currentColor"
                                    d="M192 32c-10 0-20 4-27.3 11.3l-136 136c-15.6 15.6-15.6 40.9 0 56.6s40.9 15.6 56.6 0L160 142.6V456c0 22.1 17.9 40 40 40s40-17.9 40-40V142.6l74.7 74.7c15.6 15.6 40.9 15.6 56.6 0s15.6-40.9 0-56.6l-136-136C212 36 202 32 192 32z"
                                />
                    }
                    </svg>
                </th>
                <th onClick={sortingUsersHandler}>
                    Email
                    <svg aria-hidden="true" focusable="false" data-prefix="fas"
                    data-icon="arrow-down" className={sorting.sortName === 'email'? 
                                                                "icon active-icon svg-inline--fa fa-arrow-down Table_icon__+HHgn" 
                                                                : "icon svg-inline--fa fa-arrow-down Table_icon__+HHgn"
                    } role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    {sorting.sort === 'ASC' ?
                                <path fill="currentColor"
                                    d="M374.6 310.6l-160 160C208.4 476.9 200.2 480 192 480s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 370.8V64c0-17.69 14.33-31.1 31.1-31.1S224 46.31 224 64v306.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0S387.1 298.1 374.6 310.6z"
                                />
                                :
                                <path fill="currentColor"
                                    d="M192 32c-10 0-20 4-27.3 11.3l-136 136c-15.6 15.6-15.6 40.9 0 56.6s40.9 15.6 56.6 0L160 142.6V456c0 22.1 17.9 40 40 40s40-17.9 40-40V142.6l74.7 74.7c15.6 15.6 40.9 15.6 56.6 0s15.6-40.9 0-56.6l-136-136C212 36 202 32 192 32z"
                                />
                    }
                    </svg>
                </th>
                <th onClick={sortingUsersHandler}>
                    Phone
                    <svg aria-hidden="true" focusable="false" data-prefix="fas"
                    data-icon="arrow-down" className={sorting.sortName === 'phoneNumber'? 
                                                                "icon active-icon svg-inline--fa fa-arrow-down Table_icon__+HHgn" 
                                                                : "icon svg-inline--fa fa-arrow-down Table_icon__+HHgn"
                    } role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    {sorting.sort === 'ASC' ?
                                <path fill="currentColor"
                                    d="M374.6 310.6l-160 160C208.4 476.9 200.2 480 192 480s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 370.8V64c0-17.69 14.33-31.1 31.1-31.1S224 46.31 224 64v306.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0S387.1 298.1 374.6 310.6z"
                                />
                                :
                                <path fill="currentColor"
                                    d="M192 32c-10 0-20 4-27.3 11.3l-136 136c-15.6 15.6-15.6 40.9 0 56.6s40.9 15.6 56.6 0L160 142.6V456c0 22.1 17.9 40 40 40s40-17.9 40-40V142.6l74.7 74.7c15.6 15.6 40.9 15.6 56.6 0s15.6-40.9 0-56.6l-136-136C212 36 202 32 192 32z"
                                />
                    }
                    </svg>
                </th>
                <th onClick={sortingUsersHandler}>
                    Created
                    <svg aria-hidden="true" focusable="false" data-prefix="fas"
                    data-icon="arrow-down" className={sorting.sortName === 'createdAt'? 
                                                                "icon active-icon svg-inline--fa fa-arrow-down Table_icon__+HHgn" 
                                                                : "icon svg-inline--fa fa-arrow-down Table_icon__+HHgn"
                    } role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    {sorting.sort === 'ASC' ?
                                <path fill="currentColor"
                                    d="M374.6 310.6l-160 160C208.4 476.9 200.2 480 192 480s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 370.8V64c0-17.69 14.33-31.1 31.1-31.1S224 46.31 224 64v306.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0S387.1 298.1 374.6 310.6z"
                                />
                                :
                                <path fill="currentColor"
                                    d="M192 32c-10 0-20 4-27.3 11.3l-136 136c-15.6 15.6-15.6 40.9 0 56.6s40.9 15.6 56.6 0L160 142.6V456c0 22.1 17.9 40 40 40s40-17.9 40-40V142.6l74.7 74.7c15.6 15.6 40.9 15.6 56.6 0s15.6-40.9 0-56.6l-136-136C212 36 202 32 192 32z"
                                />
                    }
                    </svg>
                </th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => 
                <UserListItem 
                    key={user._id} 
                    onInfoClick={userInfoClickHandler}
                    onDeleteClick={userDeleteClickHandler}
                    onEditClick={userEditClickHandler}
                    {...user} 
                />)}
                
            </tbody>
            </table>
        </div>

        {/*<!-- New user button  -->*/}
        <button className="btn-add btn" onClick={createUserClickHandler}>Add new user</button>

        <Pagination 
            pages={pages}
            currentPage={currentPage}
            onChangePage={changeCurrentPageHandler}
            onSetItemsPerPage={setItemsPerPagePaginationHandler}
        />
    </section>
        </>
    )
}
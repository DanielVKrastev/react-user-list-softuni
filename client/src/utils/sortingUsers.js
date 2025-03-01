export const sortingUsers = (userBase, sortName, sortBy) => {
    let sortedResult = [];
    if(sortBy === 'ASC'){
        sortedResult = Object.values(userBase)
                            .sort((a, b) => a[sortName].localeCompare(b[sortName]));
    }else if(sortBy === 'DESC'){
        sortedResult = Object.values(userBase)
                            .sort((a, b) => b[sortName].localeCompare(a[sortName]));
    }  

    console.log(sortedResult);
    
    return sortedResult;
}
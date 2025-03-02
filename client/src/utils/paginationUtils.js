export const pagination = (sortedResult, itemsPerPage) => {
    let numberSliceArray = sortedResult.length / itemsPerPage;
    const slicesArraysResult = [];

    let fromSlice =  sortedResult.length - itemsPerPage;
    if(itemsPerPage > sortedResult.length){
        fromSlice =  0;
    }
    let toSlice = sortedResult.length;

    
    while(numberSliceArray > 0){
        let slicedArray = sortedResult.splice(fromSlice, toSlice);
        slicesArraysResult.push(slicedArray);

        fromSlice -= itemsPerPage;
        toSlice -= itemsPerPage;
        
        numberSliceArray--;
    };

    return slicesArraysResult;
};
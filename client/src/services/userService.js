const baseUrl = 'http://localhost:3030/jsonstore/users';

export default {
    async getAll() {
        const response = await fetch(baseUrl);
        const result = await response.json();
        const users = Object.values(result);

        return users;
    },
    async getOne(userId) {
        const response = await fetch(`${baseUrl}/${userId}`);
        const user = await response.json();
        return user;
    },
    async create(userData) {
        const postData = transformUserData(userData, 'create');

        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        const result = await response.json();

        return result;
    },
    async update(userId, userData){
        const updateData = transformUserData(userData, 'update');
        updateData._id = userId;

        const user = await this.getOne(userId);
        const createdAt = user.createdAt;
        console.log(createdAt);
        
        updateData.createdAt = createdAt;

        const response = await fetch(`${baseUrl}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        const result = await response.json();

        return result;
    },
    async delete(userId) {
        const response = await fetch(`${baseUrl}/${userId}`, {
            method: 'DELETE',
        });
        const result = await response.json();

        return result;
    }
};

function transformUserData(userData, option){
    const { country, city, street, streetNumber, ...postData } = userData;

    postData.address = { country, city, street, streetNumber };
    if(option === 'create'){
        postData.createdAt = new Date().toISOString();
    }
    postData.updatedAt = new Date().toISOString();

    return postData;
}
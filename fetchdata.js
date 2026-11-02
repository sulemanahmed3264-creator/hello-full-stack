async function getUsers() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        const data = await res.json();
        
        user.slice(0, 5).forEach(({ name , email }) => {
            console.log(`Name: ${name}- ${email}`);
        });

    } catch (err) {
        console.log("Error: " + err.message);
    }
}
getUsers();
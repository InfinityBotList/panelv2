export const logoutUser = async () => {
    localStorage.clear();
    window.location.reload()
}
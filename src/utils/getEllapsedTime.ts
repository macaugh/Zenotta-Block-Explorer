
export const getEllapsedTime = (timestamp: number) => {
    let now = new Date();
    let blocktime = new Date(timestamp * 1000);
    // let difference = now.getTime() - blocktime.getTime();
    let ellapsedSeconds = Math.abs(now.getTime() - blocktime.getTime())/1000;
    let ellapsedMinutes = ellapsedSeconds/60;
    let ellapsedHours = ellapsedMinutes/60;

    if (ellapsedSeconds < 60) {
        return `${Math.floor(ellapsedSeconds)} seconds ago`;
    } else if (ellapsedMinutes < 60) {
        return `${Math.floor(ellapsedMinutes)} minutes ago`;
    } else if (ellapsedHours < 24) {
        let minutes = Math.floor((ellapsedHours - Math.floor(ellapsedHours)) * 60);
        return `${Math.floor(ellapsedHours)}h${minutes < 10 ? '0'+minutes: minutes}m ago`;
    } else {
        return blocktime.toLocaleString();
    }
}
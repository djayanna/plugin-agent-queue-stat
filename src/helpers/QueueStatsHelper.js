
export default class QueueStatsHelper {
    
    static getActiveTasks(queueList) {
       return  Object.values(queueList).reduce((acc, item) => {
    
            const assigned =  item.tasks_by_status?.assigned || 0;
            const wrapping =  item.tasks_by_status?.wrapping || 0;
            
            return acc + assigned + wrapping
       }, 0);
    }

    static getWaitingTasks(queueList) {
        return  Object.values(queueList).reduce((acc, item) =>
        {   
            const reserved =  item.tasks_by_status?.reserved || 0;
            const pending =  item.tasks_by_status?.pending || 0;
            
            return acc + reserved + pending
       }, 0);
     }
}
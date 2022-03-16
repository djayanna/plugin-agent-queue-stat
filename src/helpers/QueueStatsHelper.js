
export default class QueueStatsHelper {
    
    static getActiveTasks(queueList) {
       return  Object.values(queueList).reduce((acc, item) => acc + item.tasks_by_status.assigned + item.tasks_by_status.wrapping, 0)
    }

    static getWaitingTasks(queueList) {
        return  Object.values(queueList).reduce((acc, item) => acc + item.tasks_by_status.reserved + item.tasks_by_status.pending, 0)
     }

}
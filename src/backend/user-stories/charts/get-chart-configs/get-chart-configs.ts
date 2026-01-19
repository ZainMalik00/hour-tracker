import UserService from '../../../services/user-service';
import ChartService, { ChartType } from '../../../services/chart-service';
import { ChartConfig } from '../../../entities/ChartConfig';

export const GetChartConfigs = async (email: string, chartType: ChartType): Promise<ChartConfig[] | null>  => {
    if (!email) { return null; }
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        const userID = existingUserID[0];
        
        const userChartConfigs = await ChartService.getChartConfigs(userID, chartType).then((result: any) => {return result});
        return userChartConfigs;
    }
    return null;
}
import UserService from '../../../services/user-service';
import ChartService from '../../../services/chart-service';
import { ChartConfig } from '../../../entities/ChartConfig';

export const UpdateChartConfigs = async (email, chartConfigs: ChartConfig[]) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        ChartService.updateChartConfigs(existingUserID[0], chartConfigs);
    }
}
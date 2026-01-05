import UserService from '../../../services/user-service';
import ChartService, { ChartType } from '../../../services/chart-service';
import { ChartConfig } from '../../../entities/ChartConfig';

export const UpdateChartConfigs = async (email: string, chartConfigs: ChartConfig[], chartType: ChartType) => {
    const existingUserID = await UserService.getUserIdByEmail(email);
    
    if(existingUserID.length > 0){
        ChartService.updateChartConfigs(existingUserID[0], chartConfigs, chartType);
    }
}
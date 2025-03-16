import UserService from '../../../services/user-service.ts';
import { User } from '../../../entities/User.ts';
import { DefaultCategories } from '../../../entities/DefaultCategories.ts';

export const AddUser = async (name, email, password) => {
    const newUser = User(
        name,
        email,
        password,
        DefaultCategories,
    );

    const existingUser = await UserService.getUserByEmail(newUser.email);

    if(existingUser.length === 0){
        UserService.addUser(newUser);
    }
}

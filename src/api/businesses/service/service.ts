import { IBusinessFilter } from './service.types';
import { Business, IBusiness } from '@/persistance/models';

class BusinessesService {
  createBusinesses(businesses: IBusiness[]): Promise<IBusiness[]> {
    return Business.create(businesses);
  }

  async deleteOneBusiness(id: string): Promise<void> {
    await Business.deleteOne({ _id: id });
  }

  async updateOneBusiness(id: string, fieldsToUpdate: Partial<IBusiness>): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(id, fieldsToUpdate, { new: true });
  }

  getOneBusinessById(id: string): Promise<IBusiness | null> {
    return Business.findById(id).exec();
  }

  // TODO Write getFilteredBusinesses()
  async getFilteredBusinesses(filter: IBusinessFilter): Promise<IBusiness[]> {
    // calculate min/max lat + min/max long based on request location + max distance
    // filter businesses based on filter params
    await Business.findById(filter).exec();
    return [];
  }
}

export const businessesService = new BusinessesService();

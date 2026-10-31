import { BaseService } from './BaseService'

import { APIAdapter } from '../util/APIAdapter'
import { SubmissionData } from '../interface/data/SubmissionData'
import { Submission } from '../interface/Submission'
import { SubmissionModel } from '../model/SubmissionModel'

export class SubmissionService extends BaseService<SubmissionData, Submission>{
  constructor(apiAdapter: APIAdapter){
    super(apiAdapter, "/submissions", SubmissionModel, ['type', 'status'])
  }
}
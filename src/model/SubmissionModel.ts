import { APIAdapter } from '../util/APIAdapter'
import { BaseModel } from './BaseModel'
import type { Submission } from '../interface/Submission'
import type { SubmissionData } from '../interface/data/SubmissionData'
import type { Decision } from '../interface/Decision'
import { DecisionModel } from './DecisionModel'
import { BadDataError, ResourceNotFoundError, ResourceExistsError } from '../errors'

export class SubmissionModel extends BaseModel implements Submission{
  readonly type: string
  readonly resource: string
  readonly previous: {[key: string]: string}
  readonly changes: {[key: string]: string}
  readonly status: string

  public note: string

  private __apiAdapter: APIAdapter

  constructor(submission: any, adapter: APIAdapter){
    super(submission.self, adapter)

    this.type = submission.type
    this.resource = submission.resource
    this.previous = submission.previous
    this.changes = submission.changes
    this.status = submission.status
    this.note = submission.note

    this.__apiAdapter = adapter
  }

  get decision(): Promise<Decision>{
    return new Promise((resolve, reject) => {
      this.__apiAdapter.get(
        `${this.uri}/decision`
      ).then(decision => {
        resolve(new DecisionModel(decision.data, this.__apiAdapter))
      }).catch(error => {
        if(error.code == 404){
          error = new ResourceNotFoundError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  approve(note: string): Promise<Decision>{
    return this.__decide(true, note)
  }

  reject(note: string): Promise<Decision>{
    return this.__decide(false, note)
  }

  private __decide(approved, note): Promise<Decision>{
    return new Promise((resolve, reject) => {
      this.__apiAdapter.post(`${this.uri}/decision`, {
        approved: approved,
        note: note ? note : null
      }).then(decision => {
        resolve(new DecisionModel(decision.data, this.__apiAdapter))
      }).catch(error => {
        if(error.code == 400){
          error = new BadDataError(error.code, error.message)
        }else if(error.code == 409){
          error = new ResourceExistsError(error.code, error.message)
        }

        reject(error)
      })
    })
  }

  serialise(): SubmissionData{
    return {
      note: this.note
    }
  }
}
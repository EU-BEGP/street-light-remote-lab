import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Experiment } from '../interfaces/experiment';
import config from 'src/app/config.json';

@Injectable({
  providedIn: 'root'
})
export class ExperimentService {
  private httpOptions = <any>{};
  private URL: string = "";

  constructor(private http: HttpClient) {
    this.URL = `${config.api.baseUrl}${config.api.streetLights.experiment}`;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response' as 'response',
    };
  }

  getExperiments(userId?: number): Observable<Experiment[]> {
    const url = userId ? `${this.URL}?owner=${userId}` : this.URL;
    return this.http.get<Experiment[]>(url);
  }

  getExperimentById(experimentId: number): Observable<Experiment> {
    return this.http.get<Experiment>(`${this.URL}${experimentId}/`);
  }

  createExperiment(experiment: Experiment): Observable<Experiment> {
    return this.http.post<Experiment>(this.URL, experiment);
  }

  updateExperiment(experiment: Experiment, id: number): Observable<Experiment> {
    return this.http.patch<Experiment>(`${this.URL}${id}/`, experiment);
  }

  deleteExperiment(id: number): Observable<Experiment> {
    return this.http.delete<Experiment>(`${this.URL}${id}/delete/`);
  }

  getExperimentGrid(experimentId?: number): Observable<Experiment> {
    return this.http.get<Experiment>(`${this.URL}${experimentId}/grid/`);
  }

}

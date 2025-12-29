import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api';

  getProfileData(): Observable<any> {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      console.error('No user ID found');
      return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      catchError(error => {
        console.error('Error fetching profile data:', error);
        return of(null);
      })
    );
  }

  updateProfile(userId: number, profileData: any): Observable<any> {
    // Note: userId is not used in the URL anymore as we use the authenticated user
    return this.http.put<any>(`${this.apiUrl}/profile`, profileData).pipe(
      catchError(error => {
        console.error('Error updating profile:', error);
        throw error;
      })
    );
  }
}

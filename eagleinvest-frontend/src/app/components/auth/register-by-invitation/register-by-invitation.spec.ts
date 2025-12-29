import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterByInvitation } from './register-by-invitation';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('RegisterByInvitation', () => {
  let component: RegisterByInvitation;
  let fixture: ComponentFixture<RegisterByInvitation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterByInvitation]
      ,
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ token: 'test-token' })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterByInvitation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

# EduPage - Testing & Verification Sequence

This guide provides a step-by-step path to verify the core financial and administrative workflows. 

### Phase 1: Authentication & Setup
1. **Login as Admin**
   - **POST** `/api/auth/login`
   - Body: `{ "email": "admin@edupage.com", "password": "admin123" }`
   - *Result: Copy the 'token' for subsequent requests.*

2. **Create a Accountant**
   - **POST** `/api/auth/register`
   - Body: `{ "email": "accountant@edupage.com", "password": "password123", "firstName": "Finance", "lastName": "Manager", "role": "ACCOUNTANT" }`

3. **Create a Student**
   - **POST** `/api/auth/register`
   - Body: `{ "email": "student.new@edupage.com", "password": "password123", "firstName": "Alex", "lastName": "Doe", "role": "STUDENT" }`
   - *Result: Note the 'id' and 'accountNumber' from the response.*

### Phase 2: Administrative Organization
4. **Create a Class Group**
   - **POST** `/api/admin/class-groups`
   - Body: `{ "name": "Grade-10", "grade": 10, "monthlyFee": 4000 }`
   - *Result: Note the 'id' (let's assume it's 1).*

5. **Assign Student to Class**
   - **PUT** `/api/admin/students/{id}/class`
   - Body: `{ "classGroupId": 1 }`

### Phase 3: Invoicing & Debt Management
6. **Generate Monthly Invoice** (Admin Only)
   - **POST** `/api/invoices/generate/student?studentId={id}&year=2024&month=3`
   - *Result: This links the student to a 4000 unit debt.*

7. **Verify Debt Status**
   - **GET** `/api/invoices/debt/{id}`
   - *Output should reflect the 4000 unit balance.*

### Phase 4: Payment Submission (Student Flow)
8. **Login as Student**
   - **POST** `/api/auth/login`
   - Body: `{ "email": "student.new@edupage.com", "password": "password123" }`

9. **Submit Payment Request**
   - **POST** `/api/payment/submit`
   - Body: `{ "accountNumber": "{accountNumber}", "amount": 4000, "receiptNumber": "TXN-998877" }`

### Phase 5: Accountant Approval
10. **Login as Accountant**
    - **POST** `/api/auth/login`
    - Body: `{ "email": "accountant@edupage.com", "password": "password123" }`

11. **Review & Approve**
    - **GET** `/api/payment/pending` -> Note the payment 'id'.
    - **POST** `/api/payment/{id}/approve`

12. **Final Debt Check**
    - **GET** `/api/invoices/debt/{studentId}`
    - *Result: Total debt should now be 0.*

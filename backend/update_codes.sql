ALTER TABLE Employees NOCHECK CONSTRAINT ALL;

-- Update Employees
UPDATE Employees SET gender_code = 'MALE' WHERE gender_code = 'M';
UPDATE Employees SET gender_code = 'FEMALE' WHERE gender_code = 'F';
UPDATE Employees SET gender_code = 'OTHER' WHERE gender_code = 'O';

UPDATE Employees SET marital_status_code = 'SINGLE' WHERE marital_status_code = 'S';
UPDATE Employees SET marital_status_code = 'MARRIED' WHERE marital_status_code = 'M';
UPDATE Employees SET marital_status_code = 'DIVORCED' WHERE marital_status_code = 'D';
UPDATE Employees SET marital_status_code = 'WIDOWED' WHERE marital_status_code = 'W';

-- Update Master Tables
UPDATE Genders SET code = 'MALE' WHERE code = 'M';
UPDATE Genders SET code = 'FEMALE' WHERE code = 'F';
UPDATE Genders SET code = 'OTHER' WHERE code = 'O';

UPDATE MaritalStatuses SET code = 'SINGLE' WHERE code = 'S';
UPDATE MaritalStatuses SET code = 'MARRIED' WHERE code = 'M';
UPDATE MaritalStatuses SET code = 'DIVORCED' WHERE code = 'D';
UPDATE MaritalStatuses SET code = 'WIDOWED' WHERE code = 'W';

ALTER TABLE Employees CHECK CONSTRAINT ALL;

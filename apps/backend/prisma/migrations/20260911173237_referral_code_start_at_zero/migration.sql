-- Codes are now unpadded ("EBN0", "EBN1", …) and meant to start at 0.
-- Only restart the sequence if nothing has used it yet — if real signups
-- already got sequence 1, 2, … since referral_codes was created, forcing
-- it back to 0 would collide with those rows on the next insert.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "referral_codes") THEN
    -- Default SERIAL sequences have MINVALUE 1; raise it to 0 first, or
    -- RESTART WITH 0 would be rejected as below the sequence's minimum.
    ALTER SEQUENCE "referral_codes_sequence_seq" MINVALUE 0 RESTART WITH 0;
  END IF;
END $$;

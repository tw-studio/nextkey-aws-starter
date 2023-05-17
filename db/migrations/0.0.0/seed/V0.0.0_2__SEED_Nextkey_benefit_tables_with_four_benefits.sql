/* V0.0.0_2__SEED_Nextkey_benefit_tables_with_four_benefits.sql */
DO $$

DECLARE 
  new_benefit_id nextkey_benefit_meta.nextkey_benefit_id%TYPE;

BEGIN
  INSERT 
    INTO nextkey_benefit_meta 
    DEFAULT VALUES 
    RETURNING nextkey_benefit_id INTO new_benefit_id;
  INSERT
    INTO nextkey_benefit_data
    VALUES
      (new_benefit_id, 'index', '1'),
      (new_benefit_id, 'benefit_name', '"Secure Your Apps"'),
      (new_benefit_id,
        'benefit_description',
        '"Password protect your Next.js applications during their development."');

  INSERT 
    INTO nextkey_benefit_meta 
    DEFAULT VALUES 
    RETURNING nextkey_benefit_id INTO new_benefit_id;
  INSERT
    INTO nextkey_benefit_data
    VALUES
      (new_benefit_id, 'index', '2'),
      (new_benefit_id, 'benefit_name', '"Flexible Deployment"'),
      (new_benefit_id,
        'benefit_description',
        '"Deploy multiple versions of your app on a single domain with unique passwords."');
        
  INSERT 
    INTO nextkey_benefit_meta 
    DEFAULT VALUES 
    RETURNING nextkey_benefit_id INTO new_benefit_id;
  INSERT
    INTO nextkey_benefit_data
    VALUES
      (new_benefit_id, 'index', '3'),
      (new_benefit_id, 'benefit_name', '"Enjoy AWS Free Tier"'),
      (new_benefit_id,
        'benefit_description',
        '"Launch your app with NextKey and take advantage of the AWS Free Tier&apos;s cost-free resources."');

  INSERT 
    INTO nextkey_benefit_meta 
    DEFAULT VALUES 
    RETURNING nextkey_benefit_id INTO new_benefit_id;
  INSERT
    INTO nextkey_benefit_data
    VALUES
      (new_benefit_id, 'index', '4'),
      (new_benefit_id, 'benefit_name', '"Continuous Integration"'),
      (new_benefit_id,
        'benefit_description',
        '"Connect your code to a CodePipeline in AWS for automated deployments."');
END;

$$;

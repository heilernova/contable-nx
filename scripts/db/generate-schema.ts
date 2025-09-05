import { readFileSync } from 'node:fs';
import { hash } from 'argon2';
import * as https from 'https';

const prepareSQL = (table: string, object: { [key: string]: string | number | object | null | boolean }) => {
  return `INSERT INTO ${table} ("${Object.keys(object).join('", "')}") VALUES (${Object.values(object).map(x => typeof x === "string" ? `'${x}'` : (typeof x === "number" ? x : (typeof x === "boolean" ? (x ? "TRUE" : "FALSE") :  `'${JSON.stringify(x)}'`)))});`;
}

const parseCSVLine = <T>(line: string): T[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result as unknown as T[];
}

const extractData = <T = string[]>(urlCodes: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    https.get(urlCodes, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const lines = data.trim().split('\n');
        lines.splice(0, 1); // Eliminar la primera línea (encabezados)
        const result = lines.map(x => parseCSVLine<T>(x));
        resolve(result as any);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

export const generateSchema = async (options?: { includeData?: boolean }) => {
  let schemaBase = readFileSync('data/schema.postgres.sql', 'utf-8');

  // Usuario por defecto
  const defaultUser = {
    id: '6e223337-d5cf-4ec7-9dc8-127638fd5a82',
    created_at: new Date(),
    updated_at: new Date(),
    role: 'admin',
    is_accountant: true,
    status: 'active',
    username: 'admin',
    email: 'admin@example.com',
    name: 'Admin',
    last_name: 'User',
    sex: 'M',
    cellphone: '+57 300 000 0000',
    pin: '1234',
    password: await hash('admin'),
    jwt_secret_key: '86a88375-2374-4558-9757-9fe52f7bec46',
    // permissions: []
  };

  schemaBase += '\n\n-- Usuario por defecto\n';
  schemaBase += prepareSQL('users', defaultUser);

  if (options?.includeData) {
    // Incluir datos de ejemplo
    
    // Códigos CIIU
    const urlCIIUSections = 'https://raw.githubusercontent.com/heilernova/ciiu/refs/heads/main/sections.csv';
    const sections: [string, string][] = await extractData(urlCIIUSections);
    schemaBase += '\n\n-- CIIU divisions\n';
    schemaBase += `\n\n-- Fuente: ${urlCIIUSections}\n`;
    schemaBase += 'INSERT INTO data_ciiu_sections ("code", "description") VALUES\n';
    sections.forEach((row, index) => {
      schemaBase += `('${row[0]}', '${row[1]}')${index < sections.length - 1 ? ',' : ';'}\n`;
    });

    // Divisiones
    const urlCIIUDivisions = 'https://raw.githubusercontent.com/heilernova/ciiu/refs/heads/main/divisions.csv';

    const divisions: [string, string, string][] = await extractData(urlCIIUDivisions);
    schemaBase += '\n\n-- CIIU divisions\n';
    schemaBase += `\n\n-- Fuente: ${urlCIIUDivisions}\n`;
    schemaBase += 'INSERT INTO data_ciiu_divisions ("section_code", "code", "description") VALUES\n';
    divisions.forEach((row, index) => {
      schemaBase += `('${row[0]}', '${row[1]}', '${row[2]}')${index < divisions.length - 1 ? ',' : ';'}\n`;
    });

    const urlCIIUGroups = 'https://raw.githubusercontent.com/heilernova/ciiu/refs/heads/main/groups.csv';
    const groups: [string, string][] = await extractData(urlCIIUGroups);
    schemaBase += '\n\n-- CIIU groups\n';
    schemaBase += `\n\n-- Fuente: ${urlCIIUGroups}\n`;
    schemaBase += 'INSERT INTO data_ciiu_groups ("code", "division_code", "description") VALUES\n';
    groups.forEach((row, index) => {
      schemaBase += `('${row[0]}', '${row[0].substring(0, 2)}', '${row[1]}')${index < groups.length - 1 ? ',' : ';'}\n`;
    });

    const urlCodes = 'https://raw.githubusercontent.com/heilernova/ciiu/refs/heads/main/codes.csv';
    const rows: [string, string][] = await extractData(urlCodes) ;
    schemaBase += '\n\n-- CIIU codes\n';
    schemaBase += `-- Fuente: ${urlCodes}\n`;
    schemaBase += 'INSERT INTO data_ciiu_codes ("code", "group_code", "description") VALUES\n';
    rows.forEach((row, index) => {
      schemaBase += `('${row[0]}', '${row[0].substring(0, 3)}', '${row[1]}')${index < rows.length - 1 ? ',' : ';'}\n`;
    });

    // Responsabilidades fiscales
    const urlTaxResponsibilities = 'https://raw.githubusercontent.com/heilernova/colombia-data/refs/heads/main/dian/tax-responsibilities.csv';
    const taxResponsibilities: [string, string][] = await extractData(urlTaxResponsibilities);
    schemaBase += '\n\n-- Responsabilidades fiscales\n';
    schemaBase += `\n\n-- Fuente: ${urlTaxResponsibilities}\n`;
    schemaBase += 'INSERT INTO data_tax_responsibilities ("code", "name") VALUES\n';
    taxResponsibilities.forEach((row, index) => {
      schemaBase += `('${row[0]}', '${row[1]}')${index < taxResponsibilities.length - 1 ? ',' : ';'}\n`;
    });;

    // Tipos de identificación fiscal
    const urlIdTypes = 'https://raw.githubusercontent.com/heilernova/colombia-data/refs/heads/main/dian/tax-id-type.csv';
    const idTypes: [string, string, string][] = await extractData(urlIdTypes);
    schemaBase += '\n\n-- Tipos de identificación fiscal\n';
    schemaBase += `\n\n-- Fuente: ${urlIdTypes}\n`;
    schemaBase += 'INSERT INTO data_tax_id_types ("code", "name", "short_name") VALUES\n';
    idTypes.forEach((row, index) => {
      schemaBase += `('${row[0]}', '${row[1]}', '${row[2]}')${index < idTypes.length - 1 ? ',' : ';'}\n`;
    });

    // UNSPSC

    // Segmentos UNSPSC
    const urlUNSPSCSegments = 'https://raw.githubusercontent.com/heilernova/colombia-data/refs/heads/main/unspsc/segments.csv';
    const segments: [string, string][] = await extractData(urlUNSPSCSegments);
    schemaBase += '\n\n-- UNSPSC segments\n';
    schemaBase += `\n\n-- Fuente: ${urlUNSPSCSegments}\n`;
    schemaBase += 'INSERT INTO data_unspsc_segments ("code", "name") VALUES\n';
    segments.forEach((row, index) => {
      schemaBase += `('${row[0]}', '${row[1]}')${index < segments.length - 1 ? ',' : ';'}\n`;
    });

    // Familias UNSPSC
    const urlUNSPSCFamilies = 'https://raw.githubusercontent.com/heilernova/colombia-data/refs/heads/main/unspsc/families.csv';
    const families: [string, string][] = await extractData(urlUNSPSCFamilies);
    schemaBase += '\n\n-- UNSPSC families\n';
    schemaBase += `\n\n-- Fuente: ${urlUNSPSCFamilies}\n`;
    schemaBase += 'INSERT INTO data_unspsc_families ("code", "segment_code", "name") VALUES\n';
    families.forEach((row, index) => {
      schemaBase += `('${row[0]}', '${row[0].substring(0, 2)}', '${row[1]}')${index < families.length - 1 ? ',' : ';'}\n`;
    });

    // Clases UNSPSC
    const urlUNSPSCClasses = 'https://raw.githubusercontent.com/heilernova/colombia-data/refs/heads/main/unspsc/classes.csv';
    const classes: [string, string][] = await extractData(urlUNSPSCClasses);
    schemaBase += '\n\n-- UNSPSC classes\n';
    schemaBase += `\n\n-- Fuente: ${urlUNSPSCClasses}\n`;
    schemaBase += 'INSERT INTO data_unspsc_classes ("code", "family_code", "name") VALUES\n';
    classes.forEach((row, index) => {
      schemaBase += `('${row[0]}', '${row[0].substring(0, 4)}', '${row[1]}')${index < classes.length - 1 ? ',' : ';'}\n`;
    });

    // Códigos UNSPSC
    const urlUNSPSC = 'https://raw.githubusercontent.com/heilernova/colombia-data/refs/heads/main/unspsc/products.csv';
    const unspsc: [string, string][] = await extractData(urlUNSPSC);
    schemaBase += '\n\n-- UNSPSC\n';
    schemaBase += `\n\n-- Fuente: ${urlUNSPSC}\n`;
    

    // ---> problemas con las comillas simples o dobles en el SQL en los nombres
    unspsc.forEach((row) => {
      const name = row[1].replace(/'/g, "''").replace(/"/g, '""').replace(/[\r\n\t]/g, ' ').trim();
      schemaBase += `INSERT INTO data_unspsc_codes ("code", "class_code", "name") VALUES ('${row[0]}', '${row[0].substring(0, 6)}', '${name}');\n`;
    });
    

    // PUC
    const urlPUC = 'https://raw.githubusercontent.com/heilernova/colombia-data/refs/heads/main/puc/puc.csv';
    const puc: [string, string][] = await extractData(urlPUC);
    schemaBase += '\n\n-- PUC\n';
    schemaBase += `\n\n-- Fuente: ${urlPUC}\n`;
    puc.forEach((row) => {
      const name = row[1].replace(/'/g, "''").replace(/"/g, '""').replace(/[\r\n\t]/g, ' ').trim();
      schemaBase += `INSERT INTO data_puc ("code", "name") VALUES ('${row[0]}', '${name}');\n`;
    });

    // Departamentos y ciudades
    const urlDepartments = 'https://raw.githubusercontent.com/heilernova/colombia-data/refs/heads/main/geo/departments.csv';
    const departments: [string, string][] = await extractData(urlDepartments);
    schemaBase += '\n\n-- Departamentos\n';
    schemaBase += `\n\n-- Fuente: ${urlDepartments}\n`;
    departments.forEach((row) => {
      schemaBase += `INSERT INTO data_geo_departments ("code", "name") VALUES ('${row[0]}', '${row[1]}');\n`;
    });

    const urlCities = 'https://raw.githubusercontent.com/heilernova/colombia-data/refs/heads/main/geo/municipalities.csv';
    const cities: [string, string, string][] = await extractData(urlCities);
    schemaBase += '\n\n-- Ciudades\n';
    schemaBase += `\n\n-- Fuente: ${urlCities}\n`;
    cities.forEach((row) => {
      console.log(`INSERT INTO data_geo_municipalities ("code", "department_code", "name") VALUES ('${row[0]}', '${row[0].substring(0, 2)}', '${row[1]}');\n`);
      schemaBase += `INSERT INTO data_geo_municipalities ("code", "department_code", "name") VALUES ('${row[0]}', '${row[0].substring(0, 2)}', '${row[1]}');\n`;
    });

  }

  return schemaBase;
}
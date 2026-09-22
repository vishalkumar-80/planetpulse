import { PrismaClient } from '@prisma/client';
const prisma=new PrismaClient();
const values=[['Car',10,'km',.2,2,'Morning commute'],['Bus',15,'km',.08,1.2,'Office trip'],['Electricity',5,'kWh',.8,4,'Home usage'],['Vegetarian Meal',2,'meals',.5,1,'Lunch'],['Non-Vegetarian Meal',1,'meals',2,2,'Dinner']] as const;
async function main(){await prisma.activity.deleteMany(); const monday=new Date();monday.setDate(monday.getDate()-((monday.getDay()+6)%7));monday.setHours(12,0,0,0);await prisma.activity.createMany({data:values.map(([type,quantity,unit,emissionFactor,co2Kg,note],i)=>{const date=new Date(monday);date.setDate(date.getDate()+i);return {type,quantity,unit,emissionFactor,co2Kg,note,date}})});await prisma.settings.upsert({where:{id:1},update:{weeklyTarget:50},create:{id:1,weeklyTarget:50}})}
main().finally(()=>prisma.$disconnect());

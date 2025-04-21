import React from 'react'

function CompaniesSection() {
    return (
        <>
            <section className="text-center my-10">
                <h2 className="text-2xl font-bold">More Than 100+ Companies</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
                    <img src="company_logo/amazon.jpg" alt="Company 1" className="h-16 mx-auto" />
                    <img src="company_logo/capgemini.jpg" alt="Company 2" className="h-16 mx-auto" />
                    <img src="company_logo/google.png" alt="Company 3" className="h-16 mx-auto" />
                    <img src="company_logo/hyundai.jpg" alt="Company 4" className="h-16 mx-auto" />
                    <img src="company_logo/microsoft.png" alt="Company 5" className="h-16 mx-auto" />
                    <img src="company_logo/samsung.png" alt="Company 6" className="h-16 mx-auto" />
                    <img src="company_logo/tcs.png" alt="Company 6" className="h-16 mx-auto" />
                    <img src="company_logo/wipro.png" alt="Company 6" className="h-16 mx-auto" />
                    <img src="company_logo/infosys.png" alt="Company 6" className="h-16 mx-auto" />
                    <img src="company_logo/airtel.png" alt="Company 6" className="h-16 mx-auto" />
                    <img src="company_logo/deloitte.png" alt="Company 6" className="h-16 mx-auto" />
                    <img src="company_logo/hdfc_bank.jpg" alt="Company 6" className="h-16 mx-auto" />
                </div>
            </section>
        </>
    )
}

export default CompaniesSection

//tentative report controllers (finalized with schema creation)
export const getAllReports = asyncHandler(async (req, res) => {
    const reports = await PatientReport.find();
    if (!reports) {
      throw createError(404, "No reports found");
    }
    res.json({ success: true, data: reports });
  });
  
  

export const getReportById = asyncHandler(async (req, res) => {
    const report = await PatientReport.findById(req.params.id);
    if (!report) {
      throw createError(404, "Report not found");
    }
    res.json({ success: true, data: report });
  });
  

export const createReport = asyncHandler(async (req, res) => {
    const report = await PatientReport.create(req.body);
    res.status(201).json({ success: true, data: report });
  });
  


export const deleteReport = asyncHandler(async (req, res) => {
    const report = await PatientReport.findByIdAndDelete(req.params.id);
    if (!report) {
      throw createError(404, "Report not found");
    }
    res.json({ success: true, message: "Report deleted successfully" });
  });

  

export const updateReport = asyncHandler(async (req, res) => {
    const report = await PatientReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!report) {
      throw createError(404, "Report not found");
    }
    res.json({ success: true, data: report });
  });
  
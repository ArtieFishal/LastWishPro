import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen, 
  Scale, 
  MapPin,
  Download,
  ExternalLink,
  Users,
  Clock,
  Star
} from 'lucide-react';

const LegalGuidancePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userState, setUserState] = useState('CA'); // Default or from user profile
  const [templates, setTemplates] = useState([]);
  const [stateRequirements, setStateRequirements] = useState(null);
  const [complianceCheck, setComplianceCheck] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLegalData();
  }, [userState]);

  const loadLegalData = async () => {
    setLoading(true);
    try {
      // Load templates, state requirements, and resources
      const [templatesRes, stateRes, resourcesRes] = await Promise.all([
        fetch('/api/legal/templates', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/legal/state-requirements/${userState}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/legal/resources', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      }

      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setStateRequirements(stateData.requirements);
      }

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData.resources || []);
      }
    } catch (error) {
      console.error('Error loading legal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runComplianceCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/legal/compliance-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ state_code: userState })
      });

      if (response.ok) {
        const data = await response.json();
        setComplianceCheck(data.compliance_check);
      }
    } catch (error) {
      console.error('Error running compliance check:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getComplianceStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'failed': return <AlertTriangle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Legal Guidance & Compliance</h1>
          <p className="text-gray-400 text-lg">
            Comprehensive legal resources for cryptocurrency estate planning
          </p>
        </div>

        {/* State Selector */}
        <div className="mb-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium">Your State:</span>
                <select 
                  value={userState} 
                  onChange={(e) => setUserState(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
                >
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  <option value="LA">Louisiana</option>
                  <option value="CO">Colorado</option>
                  <option value="WA">Washington</option>
                </select>
                <Badge variant="outline" className="text-xs">
                  {stateRequirements?.has_digital_asset_law ? 'Digital Asset Laws' : 'General Laws'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-blue-600">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-blue-600">
              <Shield className="h-4 w-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="requirements" className="data-[state=active]:bg-blue-600">
              <Scale className="h-4 w-4 mr-2" />
              Requirements
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Legal Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {templates.length}
                  </div>
                  <p className="text-sm text-gray-400">Available for your state</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    {complianceCheck ? (
                      <>
                        <div className={`w-3 h-3 rounded-full ${getComplianceStatusColor(complianceCheck.status)}`} />
                        <span className="text-lg font-semibold capitalize">{complianceCheck.status}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Not checked</span>
                    )}
                  </div>
                  <Button 
                    onClick={runComplianceCheck} 
                    disabled={loading}
                    size="sm" 
                    className="w-full"
                  >
                    Run Check
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                    Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {resources.length}
                  </div>
                  <p className="text-sm text-gray-400">Guides and articles</p>
                </CardContent>
              </Card>
            </div>

            {/* State-Specific Alert */}
            {stateRequirements && (
              <Alert className="bg-blue-900/20 border-blue-700">
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  <strong>{stateRequirements.state_name} Requirements:</strong>
                  {stateRequirements.will_notarization_required && (
                    <span className="text-yellow-400"> Notarization required.</span>
                  )}
                  {stateRequirements.will_witness_requirement > 0 && (
                    <span> {stateRequirements.will_witness_requirement} witnesses required.</span>
                  )}
                  {stateRequirements.has_digital_asset_law && (
                    <span className="text-green-400"> Digital asset laws in effect.</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Getting Started Guide */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Getting Started with Legal Planning</CardTitle>
                <CardDescription>
                  Follow these steps to create legally compliant cryptocurrency estate planning documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Review State Requirements</h4>
                      <p className="text-sm text-gray-400">Understand your state's specific laws and requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">Choose Legal Template</h4>
                      <p className="text-sm text-gray-400">Select appropriate template for your jurisdiction</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Complete Asset Inventory</h4>
                      <p className="text-sm text-gray-400">Document all cryptocurrency holdings and access methods</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <h4 className="font-semibold">Run Compliance Check</h4>
                      <p className="text-sm text-gray-400">Verify your documents meet all legal requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">5</div>
                    <div>
                      <h4 className="font-semibold">Execute Documents</h4>
                      <p className="text-sm text-gray-400">Sign, witness, and notarize as required by your state</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.state_code ? `${template.state_code} Specific` : 'General Template'}
                        </CardDescription>
                      </div>
                      <Badge variant={template.requires_notarization ? "destructive" : "secondary"}>
                        {template.requires_notarization ? 'Notarization Required' : 'Witnesses Only'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{template.witness_count} witnesses required</span>
                      </div>
                      {template.requires_notarization && (
                        <div className="flex items-center gap-2 text-sm text-yellow-400">
                          <Shield className="h-4 w-4" />
                          <span>Notarization required</span>
                        </div>
                      )}
                      {template.attorney_review_required && (
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <Scale className="h-4 w-4" />
                          <span>Attorney review recommended</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-3">
                        {template.legal_disclaimers}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
              <Button onClick={runComplianceCheck} disabled={loading}>
                <Shield className="h-4 w-4 mr-2" />
                Run New Check
              </Button>
            </div>

            {complianceCheck ? (
              <div className="space-y-6">
                {/* Overall Status */}
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getComplianceStatusIcon(complianceCheck.status)}
                      Compliance Status: {complianceCheck.status.charAt(0).toUpperCase() + complianceCheck.status.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-3xl font-bold">{complianceCheck.score}/100</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getComplianceStatusColor(complianceCheck.status)}`}
                          style={{ width: `${complianceCheck.score}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      Last checked: {new Date(complianceCheck.checked_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                {/* Issues and Warnings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {complianceCheck.issues && complianceCheck.issues.length > 0 && (
                    <Card className="bg-red-900/20 border-red-700">
                      <CardHeader>
                        <CardTitle className="text-red-400">Issues Found</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {complianceCheck.issues.map((issue, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {complianceCheck.warnings && complianceCheck.warnings.length > 0 && (
                    <Card className="bg-yellow-900/20 border-yellow-700">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">Warnings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {complianceCheck.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Recommendations */}
                {complianceCheck.recommendations && complianceCheck.recommendations.length > 0 && (
                  <Card className="bg-blue-900/20 border-blue-700">
                    <CardHeader>
                      <CardTitle className="text-blue-400">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {complianceCheck.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Star className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Compliance Check Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Run a compliance check to ensure your documents meet all legal requirements
                  </p>
                  <Button onClick={runComplianceCheck} disabled={loading}>
                    Run Compliance Check
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            {stateRequirements ? (
              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle>{stateRequirements.state_name} Legal Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Notarization Required:</span>
                          <Badge variant={stateRequirements.will_notarization_required ? "destructive" : "secondary"}>
                            {stateRequirements.will_notarization_required ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Witnesses Required:</span>
                          <Badge variant="outline">
                            {stateRequirements.will_witness_requirement}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Self-Proving Allowed:</span>
                          <Badge variant={stateRequirements.will_self_proving_allowed ? "secondary" : "outline"}>
                            {stateRequirements.will_self_proving_allowed ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Digital Asset Law:</span>
                          <Badge variant={stateRequirements.has_digital_asset_law ? "secondary" : "outline"}>
                            {stateRequirements.has_digital_asset_law ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Holographic Wills:</span>
                          <Badge variant={stateRequirements.holographic_will_allowed ? "secondary" : "outline"}>
                            {stateRequirements.holographic_will_allowed ? 'Allowed' : 'Not Allowed'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Fiduciary Access:</span>
                          <Badge variant="outline">
                            {stateRequirements.fiduciary_access_law || 'General'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {stateRequirements.digital_asset_law_name && (
                      <div className="pt-4 border-t border-gray-700">
                        <h4 className="font-semibold mb-2">Digital Asset Legislation</h4>
                        <p className="text-sm text-gray-400">
                          {stateRequirements.digital_asset_law_name}
                          {stateRequirements.digital_asset_law_effective_date && (
                            <span> (Effective: {new Date(stateRequirements.digital_asset_law_effective_date).toLocaleDateString()})</span>
                          )}
                        </p>
                      </div>
                    )}

                    {stateRequirements.additional_notes && (
                      <div className="pt-4 border-t border-gray-700">
                        <h4 className="font-semibold mb-2">Additional Notes</h4>
                        <p className="text-sm text-gray-400">{stateRequirements.additional_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="text-center py-12">
                  <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Loading Requirements</h3>
                  <p className="text-gray-400">
                    Fetching legal requirements for your state...
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {resource.summary}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {resource.resource_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <BookOpen className="h-4 w-4" />
                      <span className="capitalize">{resource.difficulty_level}</span>
                      {resource.state_specific && (
                        <>
                          <span>•</span>
                          <span>{resource.state_specific} Specific</span>
                        </>
                      )}
                    </div>
                    
                    {resource.tags && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <Button size="sm" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LegalGuidancePage;

